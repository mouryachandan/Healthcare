import { Router } from 'express';
import { addReview, listDoctorReviews } from '../controllers/reviewController.js';
import { protect, authorize } from '../middleware/auth.js';

const r = Router();
r.get('/doctor/:doctorId', listDoctorReviews);
r.post('/', protect(), authorize('user'), addReview);

export default r;
