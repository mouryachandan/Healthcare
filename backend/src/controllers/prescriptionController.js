import { Prescription } from '../models/Prescription.js';
import { Appointment } from '../models/Appointment.js';
import { Doctor } from '../models/Doctor.js';
import { createNotification } from '../utils/notify.js';

export async function createPrescription(req, res, next) {
  try {
    const appointmentId = req.body.appointmentId;
    const notes = req.body.notes || '';
    const fileUrl = req.body.fileUrl || '';
    if (!appointmentId)
      return res.status(400).json({ message: 'appointmentId required' });
    const doctor = await Doctor.findOne({ userId: req.user._id });
    const ap = await Appointment.findById(appointmentId);
    if (!ap || ap.doctorId.toString() !== doctor._id.toString())
      return res.status(404).json({ message: 'Appointment not found' });
    const pres = await Prescription.create({
      appointmentId,
      doctorId: doctor._id,
      userId: ap.userId,
      fileUrl,
      notes,
    });
    await createNotification(
      ap.userId,
      'New prescription',
      'Your doctor uploaded a prescription / report.',
      { prescriptionId: pres._id }
    );
    res.status(201).json(pres);
  } catch (e) {
    next(e);
  }
}

export async function myPrescriptions(req, res, next) {
  try {
    const list = await Prescription.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: 'appointmentId',
        select: 'date timeSlot status',
      })
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name' },
      });
    res.json(list);
  } catch (e) {
    next(e);
  }
}

export async function uploadPrescriptionFile(req, res, next) {
  try {
    const url = req.fileUrl;
    if (!url) return res.status(400).json({ message: 'File upload failed' });
    req.body.fileUrl = url;
    return createPrescription(req, res, next);
  } catch (e) {
    next(e);
  }
}
