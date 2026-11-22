import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { query } from '../../database/db';
import { logAudit } from '../../utils/auditLogger';

export async function getReportsOverview(req: AuthRequest, res: Response) {
  const orgId = req.user?.organizationId || 'org-datapulse-core';

  const reports = [
    {
      id: 'rep-01',
      title: 'Executive Financial & Pipeline Summary',
      type: 'Executive',
      dataset: 'Global Enterprise Transactions',
      recordsCount: 150,
      format: 'CSV / PDF',
      lastGenerated: new Date().toISOString(),
    },
    {
      id: 'rep-02',
      title: 'Regional Revenue & Settled Invoices',
      type: 'Financial',
      dataset: 'Global Enterprise Transactions',
      recordsCount: 150,
      format: 'CSV',
      lastGenerated: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'rep-03',
      title: 'Data Ingestion Integrity & Quality Report',
      type: 'Technical',
      dataset: 'Cloud Infrastructure Telemetry',
      recordsCount: 84,
      format: 'CSV',
      lastGenerated: new Date(Date.now() - 172800000).toISOString(),
    },
  ];

  res.json({ success: true, data: reports });
}

export async function exportReportCSV(req: AuthRequest, res: Response) {
  const orgId = req.user?.organizationId || 'org-datapulse-core';
  const { datasetId = 'ds-global-tx', category, region, status } = req.body;

  const conditions = ['organization_id = ?'];
  const params: any[] = [orgId];

  if (category) {
    conditions.push('category = ?');
    params.push(category);
  }
  if (region) {
    conditions.push('region = ?');
    params.push(region);
  }
  if (status) {
    conditions.push('status = ?');
    params.push(status);
  }

  const rows = await query<any>(
    `SELECT external_id, transaction_date, category, region, customer_name, quantity, amount, status, data_origin
     FROM transactions
     WHERE ${conditions.join(' AND ')}
     ORDER BY transaction_date DESC`,
    params
  );

  // CSV Formula Injection Prevention Function
  function sanitizeCSVCell(val: any): string {
    if (val === null || val === undefined) return '""';
    let str = String(val).replace(/"/g, '""');
    // If string starts with formula characters, prepend single quote to neutralize
    if (/^[=+\-@\t\r]/.test(str)) {
      str = `'${str}`;
    }
    return `"${str}"`;
  }

  const headers = ['Transaction ID', 'Date', 'Category', 'Region', 'Client', 'Quantity', 'Amount ($)', 'Status', 'Data Origin'];
  const csvLines = [headers.join(',')];

  for (const r of rows) {
    csvLines.push(
      [
        sanitizeCSVCell(r.external_id),
        sanitizeCSVCell(r.transaction_date),
        sanitizeCSVCell(r.category),
        sanitizeCSVCell(r.region),
        sanitizeCSVCell(r.customer_name),
        sanitizeCSVCell(r.quantity),
        sanitizeCSVCell(r.amount),
        sanitizeCSVCell(r.status),
        sanitizeCSVCell(r.data_origin),
      ].join(',')
    );
  }

  const csvContent = csvLines.join('\n');

  await logAudit({
    organizationId: orgId,
    userId: req.user?.id,
    userEmail: req.user?.email,
    action: 'REPORT_CSV_EXPORT',
    entityType: 'reports',
    details: { rowsExported: rows.length, datasetId },
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="DATAPULSE_Report_${Date.now()}.csv"`);
  res.status(200).send(csvContent);
}

