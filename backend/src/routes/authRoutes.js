import { Router } from 'express';
import {
  register,
  login,
  sendLoginOtp,
  verifyLoginOtp,
  forgotPassword,
  resetPassword,
  getMe,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const r = Router();
r.post('/register', register);
r.post('/login', login);
r.post('/send-otp', sendLoginOtp);
r.post('/verify-otp', verifyLoginOtp);
r.post('/forgot-password', forgotPassword);
r.post('/reset-password', resetPassword);
r.get('/me', protect(), getMe);

export default r;
