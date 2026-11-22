import { Router } from 'express';
import { getDatasets, getDatasetDetails, getDatasetRecords, importDatasetCSV } from './datasetsController';
import { authenticate, requireRole } from '../../middleware/auth';

const router = Router();

router.get('/', authenticate, getDatasets);
router.get('/:id', authenticate, getDatasetDetails);
router.get('/:id/records', authenticate, getDatasetRecords);
router.post('/import', authenticate, requireRole(['super_admin', 'data_analyst']), importDatasetCSV);

export default router;

