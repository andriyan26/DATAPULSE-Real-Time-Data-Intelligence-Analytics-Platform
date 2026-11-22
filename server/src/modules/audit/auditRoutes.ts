import { Router } from 'express';
import { getAuditLogs } from './auditController';
import { authenticate, requireRole } from '../../middleware/auth';

const router = Router();

router.get('/', authenticate, requireRole(['super_admin', 'data_analyst', 'manager']), getAuditLogs);

export default router;

