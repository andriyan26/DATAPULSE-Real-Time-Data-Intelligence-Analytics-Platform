import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../../middleware/auth';
import { query } from '../../database/db';
import { broadcastOrgEvent } from '../../sockets/socketServer';
import { logAudit } from '../../utils/auditLogger';

export async function getAlertRules(req: AuthRequest, res: Response) {
  const orgId = req.user?.organizationId || 'org-datapulse-core';
  const rules = await query<any>(
    `SELECT r.*, d.name as dataset_name
     FROM alert_rules r
     JOIN datasets d ON r.dataset_id = d.id
     WHERE r.organization_id = ?
     ORDER BY r.severity DESC`,
    [orgId]
  );
  res.json({ success: true, data: rules });
}

export async function createAlertRule(req: AuthRequest, res: Response) {
  const orgId = req.user?.organizationId || 'org-datapulse-core';

  const schema = z.object({
    datasetId: z.string().default('ds-global-tx'),
    title: z.string().min(5),
    metric: z.string(),
    operator: z.enum(['>', '<', '>=', '<=', '=', '!=']),
    threshold: z.number(),
    timeWindow: z.string().default('1h'),
    severity: z.enum(['info', 'warning', 'critical']).default('warning'),
  });

  const body = schema.parse(req.body);
  const id = `ar-${Date.now()}`;

  await query(
    `INSERT INTO alert_rules (id, organization_id, dataset_id, title, metric, operator, threshold, time_window, severity)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, orgId, body.datasetId, body.title, body.metric, body.operator, body.threshold, body.timeWindow, body.severity]
  );

  res.status(201).json({ success: true, data: { id, ...body } });
}

export async function getIncidents(req: AuthRequest, res: Response) {
  const orgId = req.user?.organizationId || 'org-datapulse-core';
  const incidents = await query<any>(
    `SELECT i.*, u1.name as acknowledged_by_name, u2.name as resolved_by_name
     FROM incidents i
     LEFT JOIN users u1 ON i.acknowledged_by = u1.id
     LEFT JOIN users u2 ON i.resolved_by = u2.id
     WHERE i.organization_id = ?
     ORDER BY i.created_at DESC`,
    [orgId]
  );
  res.json({ success: true, data: incidents });
}

export async function updateIncidentStatus(req: AuthRequest, res: Response) {
  const orgId = req.user?.organizationId || 'org-datapulse-core';
  const userId = req.user?.id;
  const { id } = req.params;
  const { status } = req.body;

  if (!['OPEN', 'ACKNOWLEDGED', 'RESOLVED'].includes(status)) {
    return res.status(400).json({ success: false, error: { message: 'Invalid incident status' } });
  }

  if (status === 'ACKNOWLEDGED') {
    await query(
      `UPDATE incidents SET status = 'ACKNOWLEDGED', acknowledged_by = ?, acknowledged_at = NOW() WHERE id = ? AND organization_id = ?`,
      [userId, id, orgId]
    );
  } else if (status === 'RESOLVED') {
    await query(
      `UPDATE incidents SET status = 'RESOLVED', resolved_by = ?, resolved_at = NOW() WHERE id = ? AND organization_id = ?`,
      [userId, id, orgId]
    );
  } else {
    await query(`UPDATE incidents SET status = 'OPEN' WHERE id = ? AND organization_id = ?`, [id, orgId]);
  }

  broadcastOrgEvent(orgId, 'alert.resolved', { incidentId: id, status, updatedBy: req.user?.name });

  await logAudit({
    organizationId: orgId,
    userId,
    userEmail: req.user?.email,
    action: `INCIDENT_${status}`,
    entityType: 'incidents',
    entityId: id,
  });

  res.json({ success: true, message: `Incident updated to ${status}` });
}

export async function getNotifications(req: AuthRequest, res: Response) {
  const orgId = req.user?.organizationId || 'org-datapulse-core';
  const notifications = await query<any>(
    `SELECT * FROM notifications WHERE organization_id = ? ORDER BY created_at DESC LIMIT 20`,
    [orgId]
  );
  res.json({ success: true, data: notifications });
}

export async function markNotificationRead(req: AuthRequest, res: Response) {
  const { id } = req.params;
  await query(`UPDATE notifications SET is_read = 1 WHERE id = ?`, [id]);
  res.json({ success: true, message: 'Notification marked as read' });
}

