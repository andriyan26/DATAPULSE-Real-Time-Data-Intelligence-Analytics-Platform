import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { query } from '../../database/db';
import { logAudit } from '../../utils/auditLogger';

export async function getDataQualityOverview(req: AuthRequest, res: Response) {
  const orgId = req.user?.organizationId || 'org-datapulse-core';

  const rules = await query<any>(
    `SELECT r.*, d.name as dataset_name
     FROM data_quality_rules r
     JOIN datasets d ON r.dataset_id = d.id
     WHERE d.organization_id = ?
     ORDER BY r.severity DESC`,
    [orgId]
  );

  const issues = await query<any>(
    `SELECT i.*, d.name as dataset_name, r.rule_type
     FROM data_quality_issues i
     JOIN datasets d ON i.dataset_id = d.id
     LEFT JOIN data_quality_rules r ON i.rule_id = r.id
     WHERE d.organization_id = ?
     ORDER BY i.first_detected_at DESC`,
    [orgId]
  );

  const [scoreRes] = await query<any>(
    `SELECT AVG(quality_score) as avgScore FROM datasets WHERE organization_id = ?`,
    [orgId]
  );

  res.json({
    success: true,
    data: {
      overallScore: Number(scoreRes?.avgScore || 98.4),
      rulesPassed: rules.length - issues.filter((i) => i.status !== 'resolved').length,
      totalRules: rules.length,
      activeIssuesCount: issues.filter((i) => i.status !== 'resolved').length,
      rules,
      issues,
    },
  });
}

export async function updateQualityIssue(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { status } = req.body;

  if (!['detected', 'investigating', 'resolved'].includes(status)) {
    return res.status(400).json({ success: false, error: { message: 'Invalid issue status.' } });
  }

  await query(`UPDATE data_quality_issues SET status = ?, last_detected_at = NOW() WHERE id = ?`, [status, id]);

  await logAudit({
    organizationId: req.user?.organizationId || 'org-datapulse-core',
    userId: req.user?.id,
    action: 'QUALITY_ISSUE_UPDATE',
    entityType: 'data_quality_issues',
    entityId: id,
    details: { newStatus: status },
  });

  res.json({ success: true, message: `Issue status updated to ${status}.` });
}

