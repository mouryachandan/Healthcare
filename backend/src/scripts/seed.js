import 'dotenv/config';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Doctor } from '../models/Doctor.js';

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI missing');
    process.exit(1);
  }
  await mongoose.connect(uri);
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@medisync.com';
  const pass = process.env.SEED_ADMIN_PASSWORD || 'Admin@123';
  let u = await User.findOne({ email });
  if (!u) {
    u = await User.create({
      name: 'Super Admin',
      email,
      password: pass,
      role: 'admin',
    });
    console.log('Created admin:', email, pass);
  } else {
    console.log('Admin already exists:', email);
  }

  const demoDocEmail = process.env.SEED_DOCTOR_EMAIL || 'doctor@medisync.com';
  let du = await User.findOne({ email: demoDocEmail });
  if (!du) {
    du = await User.create({
      name: 'Dr. Demo',
      email: demoDocEmail,
      password: process.env.SEED_DOCTOR_PASSWORD || 'Doctor@123',
      role: 'doctor',
    });
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const times = ['09:00', '10:00', '11:00', '14:00', '15:00'];
    await Doctor.create({
      userId: du._id,
      specialization: 'General Physician',
      experience: 8,
      fees: 800,
      hospital: 'MediSync Care',
      city: 'Mumbai',
      isVerified: true,
      bio: 'Demo doctor for MediSync.',
      availability: [{ date: tomorrow, times }],
    });
    console.log('Created demo doctor:', demoDocEmail);
  }

  const demoPatient = process.env.SEED_USER_EMAIL || 'patient@medisync.com';
  if (!(await User.findOne({ email: demoPatient }))) {
    await User.create({
      name: 'Demo Patient',
      email: demoPatient,
      password: process.env.SEED_USER_PASSWORD || 'Patient@123',
      role: 'user',
    });
    console.log('Created demo patient:', demoPatient);
  }

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
