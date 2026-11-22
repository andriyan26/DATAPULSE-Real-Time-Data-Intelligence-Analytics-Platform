import { Router } from 'express';
import { getDataSources, getPipelineRuns, retryPipeline, triggerPipeline } from './pipelinesController';
import { authenticate, requireRole } from '../../middleware/auth';

const router = Router();

router.get('/sources', authenticate, getDataSources);
router.get('/runs', authenticate, getPipelineRuns);
router.post('/:id/retry', authenticate, requireRole(['super_admin', 'data_analyst']), retryPipeline);
router.post('/trigger', authenticate, requireRole(['super_admin', 'data_analyst']), triggerPipeline);

export default router;

