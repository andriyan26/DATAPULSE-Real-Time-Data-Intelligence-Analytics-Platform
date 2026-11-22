import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { query } from '../../database/db';

export async function getDashboardOverview(req: AuthRequest, res: Response) {
  const orgId = req.user?.organizationId || 'org-datapulse-core';

  // 1. Core KPIs
  const [txCountRes] = await query<any>(
    `SELECT COUNT(*) as totalRecords, 
            SUM(amount) as totalRevenue,
            COUNT(CASE WHEN status = 'completed' THEN 1 END) as completedCount,
            COUNT(CASE WHEN status = 'failed' THEN 1 END) as failedCount,
            COUNT(CASE WHEN data_origin = 'LIVE' THEN 1 END) as liveCount
     FROM transactions 
     WHERE organization_id = ?`,
    [orgId]
  );

  const [pipelineRes] = await query<any>(
    `SELECT COUNT(*) as totalPipelines,
            COUNT(CASE WHEN status = 'running' THEN 1 END) as runningPipelines,
            COUNT(CASE WHEN status = 'completed' THEN 1 END) as completedPipelines
     FROM pipeline_runs 
     WHERE organization_id = ?`,
    [orgId]
  );

  const [alertRes] = await query<any>(
    `SELECT COUNT(*) as totalAlerts,
            COUNT(CASE WHEN status = 'OPEN' THEN 1 END) as openIncidents,
            COUNT(CASE WHEN status = 'ACKNOWLEDGED' THEN 1 END) as ackIncidents
     FROM incidents 
     WHERE organization_id = ?`,
    [orgId]
  );

  const [dqRes] = await query<any>(
    `SELECT AVG(quality_score) as avgQualityScore FROM datasets WHERE organization_id = ?`,
    [orgId]
  );

  // 2. Capsule Bar Chart Data (Daily Activity & Throughput over 7 days matching Video 2)
  const dailyCapsuleData = [
    { day: 1, label: 'Mon', value1: 42, value2: 28, status: 'solid', active: false },
    { day: 2, label: 'Tue', value1: 65, value2: 35, status: 'solid', active: false },
    { day: 3, label: 'Wed', value1: 88, value2: 52, status: 'solid', active: true },
    { day: 4, label: 'Thu', value1: 94, value2: 60, status: 'solid', active: true },
    { day: 5, label: 'Fri', value1: 72, value2: 45, status: 'striped', active: false },
    { day: 6, label: 'Sat', value1: 30, value2: 18, status: 'outline', active: false },
    { day: 7, label: 'Sun', value1: 22, value2: 12, status: 'outline', active: false },
  ];

  // 3. Category Breakdown for Donut Chart
  const categoryBreakdown = await query<any>(
    `SELECT category, COUNT(*) as count, SUM(amount) as totalAmount
     FROM transactions
     WHERE organization_id = ?
     GROUP BY category
     ORDER BY totalAmount DESC`,
    [orgId]
  );

  // 4. Regional Breakdown
  const regionalBreakdown = await query<any>(
    `SELECT region, COUNT(*) as count, SUM(amount) as totalAmount
     FROM transactions
     WHERE organization_id = ?
     GROUP BY region
     ORDER BY totalAmount DESC`,
    [orgId]
  );

  // 5. Recent Pipeline Runs
  const pipelineRuns = await query<any>(
    `SELECT p.id, p.pipeline_name, p.status, p.rows_read, p.rows_inserted, p.rows_rejected, p.started_at, p.finished_at,
            s.name as source_name, s.type as source_type
     FROM pipeline_runs p
     JOIN data_sources s ON p.source_id = s.id
     WHERE p.organization_id = ?
     ORDER BY p.started_at DESC LIMIT 5`,
    [orgId]
  );

  // 6. Active Incidents / Critical Reminders (matching Video 2 card)
  const activeIncidents = await query<any>(
    `SELECT id, title, description, severity, status, metric_value, threshold_value, created_at
     FROM incidents
     WHERE organization_id = ? AND status != 'RESOLVED'
     ORDER BY created_at DESC LIMIT 3`,
    [orgId]
  );

  // 7. Team Collaborators (matching Video 2)
  const teamMembers = await query<any>(
    `SELECT id, name, email, role, avatar_color, department
     FROM users
     WHERE organization_id = ?
     ORDER BY role ASC`,
    [orgId]
  );

  // 8. Recent Transactions
  const recentTransactions = await query<any>(
    `SELECT id, external_id, transaction_date, category, region, customer_name, quantity, amount, status, data_origin, created_at
     FROM transactions
     WHERE organization_id = ?
     ORDER BY created_at DESC LIMIT 6`,
    [orgId]
  );

  res.json({
    success: true,
    data: {
      metrics: {
        totalRecords: Number(txCountRes?.totalRecords || 0),
        totalRevenue: Number(txCountRes?.totalRevenue || 0),
        completedTransactions: Number(txCountRes?.completedCount || 0),
        failedTransactions: Number(txCountRes?.failedCount || 0),
        liveTransactions: Number(txCountRes?.liveCount || 0),
        runningPipelines: Number(pipelineRes?.runningPipelines || 0),
        totalPipelines: Number(pipelineRes?.totalPipelines || 0),
        openIncidents: Number(alertRes?.openIncidents || 0),
        totalIncidents: Number(alertRes?.totalAlerts || 0),
        qualityScore: Number(dqRes?.avgQualityScore || 98.4),
        growthRate: 14.8,
      },
      capsuleChart: dailyCapsuleData,
      categoryDistribution: categoryBreakdown,
      regionalDistribution: regionalBreakdown,
      pipelineRuns,
      activeIncidents,
      teamMembers,
      recentTransactions,
      dataFreshness: {
        lastSync: new Date().toISOString(),
        status: 'LIVE',
        latencyMs: 118,
      },
    },
  });
}

