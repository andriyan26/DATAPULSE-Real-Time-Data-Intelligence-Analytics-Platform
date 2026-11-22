import { Router } from 'express';
import { processAIChat, getConversations, getConversationMessages } from './aiController';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.post('/chat', authenticate, processAIChat);
router.get('/conversations', authenticate, getConversations);
router.get('/conversations/:id', authenticate, getConversationMessages);

export default router;

