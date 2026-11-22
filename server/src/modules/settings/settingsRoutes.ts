import { Router } from 'express';
import { getWorkspaceSettings, updateProfile, updateUserRole } from './settingsController';
import { authenticate, requireRole } from '../../middleware/auth';

const router = Router();

router.get('/workspace', authenticate, getWorkspaceSettings);
router.patch('/profile', authenticate, updateProfile);
router.patch('/users/:id/role', authenticate, requireRole(['super_admin']), updateUserRole);

export default router;

