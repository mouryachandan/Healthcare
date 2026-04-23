import { Router } from 'express';
import {
  createAppointment,
  myAppointments,
  cancelAppointment,
  rescheduleAppointment,
  doctorAppointments,
  doctorUpdateStatus,
  allAppointments,
} from '../controllers/appointmentController.js';
import { protect, authorize } from '../middleware/auth.js';

const r = Router();

r.post('/', protect(), authorize('user'), createAppointment);
r.get('/mine', protect(), authorize('user'), myAppointments);
r.get('/doctor/list', protect(), authorize('doctor'), doctorAppointments);
r.get('/admin/all', protect(), authorize('admin'), allAppointments);
r.patch('/:id/cancel', protect(), authorize('user'), cancelAppointment);
r.patch('/:id/reschedule', protect(), authorize('user'), rescheduleAppointment);
r.patch('/:id/status', protect(), authorize('doctor'), doctorUpdateStatus);

export default r;
