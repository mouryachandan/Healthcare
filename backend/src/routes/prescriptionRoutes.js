import { Router } from 'express';
import {
  createPrescription,
  myPrescriptions,
  uploadPrescriptionFile,
} from '../controllers/prescriptionController.js';
import { protect, authorize } from '../middleware/auth.js';
import {
  uploadMemory,
  uploadToCloudinary,
  requireCloudinary,
} from '../middleware/upload.js';

const r = Router();

r.get('/mine', protect(), authorize('user'), myPrescriptions);
r.post('/', protect(), authorize('doctor'), createPrescription);
r.post(
  '/upload',
  protect(),
  authorize('doctor'),
  requireCloudinary,
  uploadMemory.single('file'),
  uploadToCloudinary,
  uploadPrescriptionFile
);

export default r;
