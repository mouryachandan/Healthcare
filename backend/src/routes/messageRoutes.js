import { Router } from 'express';
import { conversation, inbox } from '../controllers/messageController.js';
import { protect } from '../middleware/auth.js';

const r = Router();
r.get('/inbox', protect(), inbox);
r.get('/with/:otherUserId', protect(), conversation);

export default r;
