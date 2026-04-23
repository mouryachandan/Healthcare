import { Router } from 'express';
import {
  dashboardStats,
  listUsers,
  setUserBlocked,
  listPendingDoctors,
  verifyDoctor,
  activityLogs,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const r = Router();
const a = [protect(), authorize('admin')];

r.get('/stats', ...a, dashboardStats);
r.get('/users', ...a, listUsers);
r.patch('/users/:id/block', ...a, setUserBlocked);
r.get('/doctors/pending', ...a, listPendingDoctors);
r.patch('/doctors/:id/verify', ...a, verifyDoctor);
r.get('/logs', ...a, activityLogs);

export default r;
