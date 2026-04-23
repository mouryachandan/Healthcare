import { Router } from 'express';
import { myNotifications, markRead } from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';

const r = Router();
r.get('/', protect(), myNotifications);
r.post('/read-all', protect(), markRead);

export default r;
