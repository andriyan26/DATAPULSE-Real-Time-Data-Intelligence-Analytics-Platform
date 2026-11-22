import { Router } from 'express';
import { getReportsOverview, exportReportCSV } from './reportsController';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.get('/', authenticate, getReportsOverview);
router.post('/export', authenticate, exportReportCSV);

export default router;

