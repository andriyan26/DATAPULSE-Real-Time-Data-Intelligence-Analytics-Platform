import { Router } from 'express';
import { getDataQualityOverview, updateQualityIssue } from './dataQualityController';
import { authenticate, requireRole } from '../../middleware/auth';

const router = Router();

router.get('/', authenticate, getDataQualityOverview);
router.patch('/issues/:id', authenticate, requireRole(['super_admin', 'data_analyst', 'manager']), updateQualityIssue);

export default router;

