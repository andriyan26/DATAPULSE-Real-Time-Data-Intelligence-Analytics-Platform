import { Router } from 'express';
import { executeAnalyticsQuery, drillDownRecords, getSavedAnalyses, saveAnalysis } from './analyticsController';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.post('/query', authenticate, executeAnalyticsQuery);
router.get('/drilldown', authenticate, drillDownRecords);
router.get('/saved', authenticate, getSavedAnalyses);
router.post('/saved', authenticate, saveAnalysis);

export default router;

