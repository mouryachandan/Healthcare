import { Appointment } from '../models/Appointment.js';
import { Doctor } from '../models/Doctor.js';
import { User } from '../models/User.js';
import { createNotification, notifyEmail } from '../utils/notify.js';
import { logActivity } from '../utils/activity.js';

async function populateAppt(a) {
  const ap = await Appointment.findById(a._id || a)
    .populate('userId', 'name email avatar phone')
    .populate({
      path: 'doctorId',
      populate: { path: 'userId', select: 'name email avatar' },
    });
  return ap;
}

export async function createAppointment(req, res, next) {
  try {
    const { doctorId, date, timeSlot, notes, reason } = req.body;
    if (!doctorId || !date || !timeSlot)
      return res.status(400).json({ message: 'doctorId, date, timeSlot required' });
    const doctor = await Doctor.findById(doctorId);
    if (!doctor || !doctor.isVerified)
      return res.status(400).json({ message: 'Invalid doctor' });
    const d = new Date(date);
    const day = doctor.availability.find(
      (x) => new Date(x.date).toDateString() === d.toDateString()
    );
    if (!day?.times?.includes(timeSlot))
      return res.status(400).json({ message: 'Slot not offered by doctor' });
    const start = new Date(d);
    start.setHours(0, 0, 0, 0);
    const end = new Date(d);
    end.setHours(23, 59, 59, 999);
    const clash = await Appointment.findOne({
      doctorId,
      date: { $gte: start, $lte: end },
      timeSlot,
      status: { $nin: ['rejected', 'cancelled'] },
    });
    if (clash) return res.status(409).json({ message: 'Slot already booked' });
    const ap = await Appointment.create({
      userId: req.user._id,
      doctorId,
      date: d,
      timeSlot,
      notes: notes || '',
      reason: reason || '',
      status: 'pending',
    });
    const docUser = await User.findById(doctor.userId);
    await createNotification(
      docUser._id,
      'New booking request',
      `${req.user.name} requested ${timeSlot} on ${d.toDateString()}`,
      { appointmentId: ap._id }
    );
    await notifyEmail(
      docUser,
      'New MediSync appointment request',
      `<p>${req.user.name} requested an appointment.</p>`
    );
    await logActivity({
      actorId: req.user._id,
      action: 'appointment_create',
      entity: 'Appointment',
      entityId: ap._id,
    });
    res.status(201).json(await populateAppt(ap));
  } catch (e) {
    next(e);
  }
}

export async function myAppointments(req, res, next) {
  try {
    const list = await Appointment.find({ userId: req.user._id })
      .sort({ date: -1 })
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name avatar' },
      });
    res.json(list);
  } catch (e) {
    next(e);
  }
}

export async function cancelAppointment(req, res, next) {
  try {
    const ap = await Appointment.findById(req.params.id);
    if (!ap || ap.userId.toString() !== req.user._id.toString())
      return res.status(404).json({ message: 'Not found' });
    if (['completed', 'cancelled'].includes(ap.status))
      return res.status(400).json({ message: 'Cannot cancel' });
    ap.status = 'cancelled';
    await ap.save();
    const doctor = await Doctor.findById(ap.doctorId);
    const docUser = await User.findById(doctor.userId);
    await createNotification(docUser._id, 'Appointment cancelled', `Patient cancelled booking`, {
      appointmentId: ap._id,
    });
    res.json(ap);
  } catch (e) {
    next(e);
  }
}

export async function rescheduleAppointment(req, res, next) {
  try {
    const { date, timeSlot } = req.body;
    const ap = await Appointment.findById(req.params.id);
    if (!ap || ap.userId.toString() !== req.user._id.toString())
      return res.status(404).json({ message: 'Not found' });
    if (!['pending', 'approved'].includes(ap.status))
      return res.status(400).json({ message: 'Cannot reschedule' });
    const doctor = await Doctor.findById(ap.doctorId);
    const d = new Date(date);
    const day = doctor.availability.find(
      (x) => new Date(x.date).toDateString() === d.toDateString()
    );
    if (!day?.times?.includes(timeSlot))
      return res.status(400).json({ message: 'Slot not available' });
    const start = new Date(d);
    start.setHours(0, 0, 0, 0);
    const end = new Date(d);
    end.setHours(23, 59, 59, 999);
    const clash = await Appointment.findOne({
      _id: { $ne: ap._id },
      doctorId: ap.doctorId,
      date: { $gte: start, $lte: end },
      timeSlot,
      status: { $nin: ['rejected', 'cancelled'] },
    });
    if (clash) return res.status(409).json({ message: 'Slot taken' });
    ap.date = d;
    ap.timeSlot = timeSlot;
    ap.status = 'pending';
    await ap.save();
    const docUser = await User.findById(doctor.userId);
    await createNotification(docUser._id, 'Reschedule request', `Patient rescheduled to ${timeSlot}`, {});
    res.json(await populateAppt(ap));
  } catch (e) {
    next(e);
  }
}

export async function doctorAppointments(req, res, next) {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    const { status } = req.query;
    const q = { doctorId: doctor._id };
    if (status) q.status = status;
    const list = await Appointment.find(q)
      .sort({ date: 1 })
      .populate('userId', 'name email avatar phone');
    res.json(list);
  } catch (e) {
    next(e);
  }
}

export async function doctorUpdateStatus(req, res, next) {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected', 'completed'].includes(status))
      return res.status(400).json({ message: 'Invalid status' });
    const doctor = await Doctor.findOne({ userId: req.user._id });
    const ap = await Appointment.findById(req.params.id);
    if (!ap || ap.doctorId.toString() !== doctor._id.toString())
      return res.status(404).json({ message: 'Not found' });
    ap.status = status;
    await ap.save();
    const patient = await User.findById(ap.userId);
    await createNotification(
      patient._id,
      'Appointment update',
      `Your appointment is now: ${status}`,
      { appointmentId: ap._id }
    );
    await notifyEmail(
      patient,
      'MediSync — Appointment update',
      `<p>Your appointment status: <strong>${status}</strong></p>`
    );
    res.json(await populateAppt(ap));
  } catch (e) {
    next(e);
  }
}

export async function allAppointments(req, res, next) {
  try {
    const list = await Appointment.find()
      .sort({ createdAt: -1 })
      .limit(500)
      .populate('userId', 'name email')
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name' },
      });
    res.json(list);
  } catch (e) {
    next(e);
  }
}
