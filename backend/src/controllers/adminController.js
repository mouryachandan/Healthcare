import { User } from '../models/User.js';
import { Doctor } from '../models/Doctor.js';
import { Appointment } from '../models/Appointment.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { logActivity } from '../utils/activity.js';
import { createNotification } from '../utils/notify.js';

export async function dashboardStats(req, res, next) {
  try {
    const [users, doctors, appointments, pendingDoctors] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Doctor.countDocuments({ isVerified: true }),
      Appointment.countDocuments(),
      Doctor.countDocuments({ isVerified: false }),
    ]);
    res.json({
      totalUsers: users,
      totalDoctors: doctors,
      pendingDoctorApprovals: pendingDoctors,
      totalAppointments: appointments,
    });
  } catch (e) {
    next(e);
  }
}

export async function listUsers(req, res, next) {
  try {
    const users = await User.find()
      .select('-password -resetPasswordToken -resetPasswordExpire')
      .sort({ createdAt: -1 })
      .limit(200);
    res.json(users);
  } catch (e) {
    next(e);
  }
}

export async function setUserBlocked(req, res, next) {
  try {
    const { blocked } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Not found' });
    if (user.role === 'admin')
      return res.status(400).json({ message: 'Cannot block admin' });
    user.isBlocked = Boolean(blocked);
    await user.save();
    await logActivity({
      actorId: req.user._id,
      action: blocked ? 'user_block' : 'user_unblock',
      entity: 'User',
      entityId: user._id,
    });
    res.json(user);
  } catch (e) {
    next(e);
  }
}

export async function listPendingDoctors(req, res, next) {
  try {
    const docs = await Doctor.find({ isVerified: false })
      .populate('userId', 'name email createdAt')
      .sort({ createdAt: -1 });
    res.json(docs);
  } catch (e) {
    next(e);
  }
}

export async function verifyDoctor(req, res, next) {
  try {
    const { approve } = req.body;
    const doc = await Doctor.findById(req.params.id).populate('userId');
    if (!doc) return res.status(404).json({ message: 'Not found' });
    doc.isVerified = Boolean(approve);
    await doc.save();
    await createNotification(
      doc.userId._id,
      approve ? 'Profile approved' : 'Profile not approved',
      approve
        ? 'You can now receive bookings on MediSync.'
        : 'Your doctor profile was rejected. Contact support.',
      {}
    );
    await logActivity({
      actorId: req.user._id,
      action: approve ? 'doctor_approve' : 'doctor_reject',
      entity: 'Doctor',
      entityId: doc._id,
    });
    res.json(doc);
  } catch (e) {
    next(e);
  }
}

export async function activityLogs(req, res, next) {
  try {
    const logs = await ActivityLog.find()
      .sort({ createdAt: -1 })
      .limit(200)
      .populate('actorId', 'name email role');
    res.json(logs);
  } catch (e) {
    next(e);
  }
}
