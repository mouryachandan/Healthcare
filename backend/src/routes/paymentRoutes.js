import { Router } from 'express';
import { createOrder, verifyPayment } from '../controllers/paymentController.js';
import { protect, authorize } from '../middleware/auth.js';

const r = Router();
r.post('/order', protect(), authorize('user'), createOrder);
r.post('/verify', protect(), authorize('user'), verifyPayment);

export default r;
