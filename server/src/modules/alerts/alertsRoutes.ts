import { Router } from 'express';
import { getAlertRules, createAlertRule, getIncidents, updateIncidentStatus, getNotifications, markNotificationRead } from './alertsController';
import { authenticate, requireRole } from '../../middleware/auth';

const router = Router();

router.get('/rules', authenticate, getAlertRules);
router.post('/rules', authenticate, requireRole(['super_admin', 'data_analyst']), createAlertRule);
router.get('/incidents', authenticate, getIncidents);
router.patch('/incidents/:id', authenticate, requireRole(['super_admin', 'data_analyst', 'manager']), updateIncidentStatus);
router.get('/notifications', authenticate, getNotifications);
router.patch('/notifications/:id/read', authenticate, markNotificationRead);

export default router;

