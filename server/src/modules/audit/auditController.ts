import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { query } from '../../database/db';

export async function getAuditLogs(req: AuthRequest, res: Response) {
  const orgId = req.user?.organizationId || 'org-datapulse-core';
  const page = parseInt(req.query.page as string || '1', 10);
  const limit = parseInt(req.query.limit as string || '20', 10);
  const action = (req.query.action as string || '').trim();
  const offset = (page - 1) * limit;

  const conditions = ['organization_id = ?'];
  const params: any[] = [orgId];

  if (action) {
    conditions.push('action LIKE ?');
    params.push(`%${action}%`);
  }

  const whereSql = `WHERE ${conditions.join(' AND ')}`;

  const [countRes] = await query<any>(`SELECT COUNT(*) as total FROM audit_logs ${whereSql}`, params);
  const total = Number(countRes?.total || 0);

  const logs = await query<any>(
    `SELECT * FROM audit_logs ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  res.json({
    success: true,
    data: {
      logs: logs.map((l) => ({
        ...l,
        details: typeof l.details === 'string' ? JSON.parse(l.details || '{}') : l.details,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
}

