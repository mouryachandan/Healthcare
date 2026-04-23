import { Review } from '../models/Review.js';
import { Doctor } from '../models/Doctor.js';

export async function addReview(req, res, next) {
  try {
    const { doctorId, rating, comment } = req.body;
    if (!doctorId || !rating)
      return res.status(400).json({ message: 'doctorId and rating required' });
    const doc = await Doctor.findById(doctorId);
    if (!doc) return res.status(404).json({ message: 'Doctor not found' });
    const rev = await Review.findOneAndUpdate(
      { userId: req.user._id, doctorId },
      { rating: Number(rating), comment: comment || '' },
      { upsert: true, new: true }
    );
    res.status(201).json(rev);
  } catch (e) {
    if (e.code === 11000)
      return res.status(400).json({ message: 'Already reviewed — use update' });
    next(e);
  }
}

export async function listDoctorReviews(req, res, next) {
  try {
    const list = await Review.find({ doctorId: req.params.doctorId })
      .populate('userId', 'name avatar')
      .sort({ createdAt: -1 });
    res.json(list);
  } catch (e) {
    next(e);
  }
}
