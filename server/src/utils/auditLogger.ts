import { query } from '../database/db';
import { randomUUID } from 'crypto';

export async function logAudit(params: {
  organizationId: string;
  userId?: string;
  userEmail?: string;
  action: string;
  entityType: string;
  entityId?: string;
  ipAddress?: string;
  details?: Record<string, any>;
}) {
  try {
    const id = `aud-${randomUUID().substring(0, 8)}`;
    await query(
      `INSERT INTO audit_logs (id, organization_id, user_id, user_email, action, entity_type, entity_id, ip_address, details)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        params.organizationId,
        params.userId || null,
        params.userEmail || null,
        params.action,
        params.entityType,
        params.entityId || null,
        params.ipAddress || '127.0.0.1',
        JSON.stringify(params.details || {}),
      ]
    );
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
}
