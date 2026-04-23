import { Doctor } from '../models/Doctor.js';
import { User } from '../models/User.js';
import { Review } from '../models/Review.js';
import { Appointment } from '../models/Appointment.js';
import { logActivity } from '../utils/activity.js';

async function doctorPublic(doc) {
  if (!doc) return null;
  const u = await User.findById(doc.userId).select('name email avatar');
  const agg = await Review.aggregate([
    { $match: { doctorId: doc._id } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const rating = agg[0] || { avg: 0, count: 0 };
  return {
    id: doc._id,
    userId: doc.userId,
    name: u?.name,
    email: u?.email,
    avatar: u?.avatar,
    specialization: doc.specialization,
    experience: doc.experience,
    fees: doc.fees,
    bio: doc.bio,
    hospital: doc.hospital,
    isVerified: doc.isVerified,
    city: doc.city,
    latitude: doc.latitude,
    longitude: doc.longitude,
    availability: doc.availability,
    ratingAvg: Math.round((rating.avg || 0) * 10) / 10,
    reviewCount: rating.count,
  };
}

export async function listDoctors(req, res, next) {
  try {
    const { specialization, city, q, verifiedOnly } = req.query;
    const filter = {};
    if (specialization)
      filter.specialization = new RegExp(specialization, 'i');
    if (city) filter.city = new RegExp(city, 'i');
    if (verifiedOnly === 'true' || req.user?.role === 'user' || !req.user)
      filter.isVerified = true;
    if (q) {
      filter.$or = [
        { specialization: new RegExp(q, 'i') },
        { hospital: new RegExp(q, 'i') },
        { bio: new RegExp(q, 'i') },
      ];
    }
    const docs = await Doctor.find(filter).populate({
      path: 'userId',
      select: 'name email avatar',
    });
    const resolved = await Promise.all(
      docs.map((d) => {
        const o = d.toObject();
        o.userId = o.userId?._id || d.userId;
        return doctorPublic(o);
      })
    );
    res.json(resolved.filter(Boolean));
  } catch (e) {
    next(e);
  }
}

export async function getDoctor(req, res, next) {
  try {
    const doc = await Doctor.findById(req.params.id).populate(
      'userId',
      'name email avatar'
    );
    if (!doc) return res.status(404).json({ message: 'Doctor not found' });
    if (!doc.isVerified && req.user?.role === 'user')
      return res.status(404).json({ message: 'Doctor not found' });
    const o = doc.toObject();
    o.userId = o.userId?._id || doc.userId;
    res.json(await doctorPublic(o));
  } catch (e) {
    next(e);
  }
}

export async function getMyDoctorProfile(req, res, next) {
  try {
    const doc = await Doctor.findOne({ userId: req.user._id }).populate(
      'userId',
      'name email avatar'
    );
    if (!doc) return res.status(404).json({ message: 'Doctor profile not found' });
    const o = doc.toObject();
    o.userId = o.userId?._id || doc.userId;
    res.json(await doctorPublic(o));
  } catch (e) {
    next(e);
  }
}

export async function updateMyDoctorProfile(req, res, next) {
  try {
    const doc = await Doctor.findOne({ userId: req.user._id });
    if (!doc) return res.status(404).json({ message: 'Doctor profile not found' });
    const {
      specialization,
      experience,
      fees,
      bio,
      hospital,
      city,
      latitude,
      longitude,
    } = req.body;
    if (specialization != null) doc.specialization = specialization;
    if (experience != null) doc.experience = Number(experience);
    if (fees != null) doc.fees = Number(fees);
    if (bio != null) doc.bio = bio;
    if (hospital != null) doc.hospital = hospital;
    if (city != null) doc.city = city;
    if (latitude != null) doc.latitude = Number(latitude);
    if (longitude != null) doc.longitude = Number(longitude);
    await doc.save();
    await logActivity({
      actorId: req.user._id,
      action: 'doctor_profile_update',
      entity: 'Doctor',
      entityId: doc._id,
    });
    res.json(await doctorPublic(doc.toObject()));
  } catch (e) {
    next(e);
  }
}

export async function setAvailability(req, res, next) {
  try {
    const doc = await Doctor.findOne({ userId: req.user._id });
    if (!doc) return res.status(404).json({ message: 'Doctor profile not found' });
    const { availability } = req.body;
    if (!Array.isArray(availability))
      return res.status(400).json({ message: 'availability must be an array' });
    doc.availability = availability.map((a) => ({
      date: new Date(a.date),
      times: a.times || [],
    }));
    await doc.save();
    res.json({ availability: doc.availability });
  } catch (e) {
    next(e);
  }
}

const SYMPTOM_MAP = {
  heart: ['Cardiology', 'Heart', 'Cardiac'],
  bone: ['Orthopedics', 'Bone', 'Orthopaedic'],
  tooth: ['Dentistry', 'Dental', 'Dentist'],
  skin: ['Dermatology'],
  child: ['Pediatrics', 'Child'],
  eye: ['Ophthalmology'],
  general: ['General', 'Physician', 'Internal'],
};

export async function recommendedDoctors(req, res, next) {
  try {
    const { symptoms, specialization } = req.query;
    let specs = [];
    if (specialization) specs.push(specialization);
    if (symptoms) {
      const s = String(symptoms).toLowerCase();
      for (const [key, vals] of Object.entries(SYMPTOM_MAP)) {
        if (s.includes(key)) specs.push(...vals);
      }
    }
    if (!specs.length) specs = ['General', 'Physician'];
    const regex = new RegExp(specs.join('|'), 'i');
    const docs = await Doctor.find({
      isVerified: true,
      specialization: regex,
    })
      .limit(12)
      .populate('userId', 'name email avatar');
    const withRatings = await Promise.all(
      docs.map(async (d) => {
        const o = d.toObject();
        o.userId = o.userId?._id || d.userId;
        const full = await doctorPublic(o);
        return full;
      })
    );
    withRatings.sort((a, b) => (b.ratingAvg || 0) - (a.ratingAvg || 0));
    res.json(withRatings);
  } catch (e) {
    next(e);
  }
}

export async function getDoctorAvailabilitySlots(req, res, next) {
  try {
    const doc = await Doctor.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Doctor not found' });
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: 'date query required' });
    const d = new Date(date);
    const day = doc.availability.find(
      (a) => new Date(a.date).toDateString() === d.toDateString()
    );
    const times = day?.times || [];
    const start = new Date(d);
    start.setHours(0, 0, 0, 0);
    const end = new Date(d);
    end.setHours(23, 59, 59, 999);
    const booked = await Appointment.find({
      doctorId: doc._id,
      date: { $gte: start, $lte: end },
      status: { $nin: ['rejected', 'cancelled'] },
    }).select('timeSlot');
    const taken = new Set(booked.map((b) => b.timeSlot));
    const free = times.filter((t) => !taken.has(t));
    res.json({ slots: free, allSlots: times });
  } catch (e) {
    next(e);
  }
}
