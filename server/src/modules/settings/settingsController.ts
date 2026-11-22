import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { query } from '../../database/db';
import { logAudit } from '../../utils/auditLogger';

export async function getWorkspaceSettings(req: AuthRequest, res: Response) {
  const orgId = req.user?.organizationId || 'org-datapulse-core';

  const [org] = await query<any>(`SELECT * FROM organizations WHERE id = ? LIMIT 1`, [orgId]);
  const members = await query<any>(
    `SELECT id, name, email, role, avatar_color, department, is_active, created_at FROM users WHERE organization_id = ? ORDER BY role ASC`,
    [orgId]
  );

  res.json({
    success: true,
    data: {
      organization: org,
      members,
    },
  });
}

export async function updateProfile(req: AuthRequest, res: Response) {
  const userId = req.user?.id;
  const { name, department } = req.body;

  if (!userId) {
    return res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
  }

  await query(`UPDATE users SET name = COALESCE(?, name), department = COALESCE(?, department) WHERE id = ?`, [
    name,
    department,
    userId,
  ]);

  res.json({ success: true, message: 'Profile updated successfully.' });
}

export async function updateUserRole(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { role } = req.body;
  const orgId = req.user?.organizationId || 'org-datapulse-core';

  if (!['super_admin', 'data_analyst', 'manager', 'viewer'].includes(role)) {
    return res.status(400).json({ success: false, error: { message: 'Invalid role.' } });
  }

  await query(`UPDATE users SET role = ? WHERE id = ? AND organization_id = ?`, [role, id, orgId]);

  await logAudit({
    organizationId: orgId,
    userId: req.user?.id,
    action: 'USER_ROLE_CHANGED',
    entityType: 'users',
    entityId: id,
    details: { newRole: role },
  });

  res.json({ success: true, message: `User role updated to ${role}.` });
}

