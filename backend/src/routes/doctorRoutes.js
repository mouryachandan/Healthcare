import { Router } from 'express';
import {
  listDoctors,
  getDoctor,
  getMyDoctorProfile,
  updateMyDoctorProfile,
  setAvailability,
  recommendedDoctors,
  getDoctorAvailabilitySlots,
} from '../controllers/doctorController.js';
import { protect, authorize } from '../middleware/auth.js';

const r = Router();

r.get('/recommended', recommendedDoctors);
r.get(
  '/profile/me',
  protect(),
  authorize('doctor'),
  getMyDoctorProfile
);
r.put(
  '/profile/me',
  protect(),
  authorize('doctor'),
  updateMyDoctorProfile
);
r.put(
  '/profile/me/availability',
  protect(),
  authorize('doctor'),
  setAvailability
);
r.get('/', listDoctors);
r.get('/:id/slots', getDoctorAvailabilitySlots);
r.get('/:id', getDoctor);

export default r;
