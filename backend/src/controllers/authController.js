import crypto from 'crypto';
import { User } from '../models/User.js';
import { Doctor } from '../models/Doctor.js';
import { Otp } from '../models/Otp.js';
import { signToken } from '../utils/jwt.js';
import { sendMail } from '../utils/mailer.js';
import { logActivity } from '../utils/activity.js';

function authResponse(user) {
  const token = signToken({ id: user._id.toString(), role: user.role });
  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
  };
}

export async function register(req, res, next) {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email, password required' });
    const r = role === 'doctor' ? 'doctor' : 'user';
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });
    const user = await User.create({ name, email, password, role: r });
    if (r === 'doctor') {
      await Doctor.create({
        userId: user._id,
        specialization: req.body.specialization || 'General',
        experience: Number(req.body.experience) || 0,
        fees: Number(req.body.fees) || 500,
        bio: req.body.bio || '',
        hospital: req.body.hospital || '',
        isVerified: false,
      });
    }
    await logActivity({
      actorId: user._id,
      action: 'register',
      entity: 'User',
      entityId: user._id,
      ip: req.ip,
    });
    res.status(201).json(authResponse(user));
  } catch (e) {
    next(e);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password, role } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password required' });
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    if (user.isBlocked)
      return res.status(403).json({ message: 'Account is blocked' });
    if (role && user.role !== role)
      return res.status(403).json({ message: 'Wrong account type for this login' });
    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    await logActivity({
      actorId: user._id,
      action: 'login',
      entity: 'User',
      entityId: user._id,
      ip: req.ip,
    });
    res.json(authResponse(user));
  } catch (e) {
    next(e);
  }
}

function randomOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function sendLoginOtp(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No account with this email' });
    if (user.isBlocked)
      return res.status(403).json({ message: 'Account is blocked' });
    const code = randomOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await Otp.deleteMany({ email: user.email.toLowerCase(), purpose: 'login' });
    await Otp.create({
      email: user.email.toLowerCase(),
      code,
      purpose: 'login',
      expiresAt,
    });
    await sendMail({
      to: user.email,
      subject: 'MediSync — Your login code',
      text: `Your OTP is ${code}. Valid for 10 minutes.`,
      html: `<p>Your MediSync login code is <strong>${code}</strong>.</p><p>Valid for 10 minutes.</p>`,
    });
    res.json({ message: 'OTP sent to your email' });
  } catch (e) {
    next(e);
  }
}

export async function verifyLoginOtp(req, res, next) {
  try {
    const { email, code, role } = req.body;
    if (!email || !code)
      return res.status(400).json({ message: 'Email and code required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (role && user.role !== role)
      return res.status(403).json({ message: 'Wrong account type for this login' });
    const record = await Otp.findOne({
      email: user.email.toLowerCase(),
      purpose: 'login',
    }).sort({ createdAt: -1 });
    if (!record || record.code !== code.trim())
      return res.status(400).json({ message: 'Invalid OTP' });
    if (record.expiresAt < new Date())
      return res.status(400).json({ message: 'OTP expired' });
    await Otp.deleteMany({ email: user.email.toLowerCase(), purpose: 'login' });
    await logActivity({
      actorId: user._id,
      action: 'login_otp',
      entity: 'User',
      entityId: user._id,
      ip: req.ip,
    });
    res.json(authResponse(user));
  } catch (e) {
    next(e);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({
        message: 'If an account exists, a reset link has been sent.',
      });
    }
    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
    user.resetPasswordExpire = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();
    const base = process.env.CLIENT_URL || 'http://localhost:5173';
    const link = `${base}/reset-password?token=${token}`;
    await sendMail({
      to: user.email,
      subject: 'MediSync — Reset your password',
      html: `<p>Click to reset your password (valid 1 hour):</p><p><a href="${link}">${link}</a></p>`,
    });
    res.json({ message: 'If an account exists, a reset link has been sent.' });
  } catch (e) {
    next(e);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body;
    if (!token || !password || password.length < 6)
      return res.status(400).json({ message: 'Token and password (min 6) required' });
    const hashed = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpire: { $gt: new Date() },
    }).select('+resetPasswordToken +resetPasswordExpire +password');
    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    res.json({ message: 'Password updated. You can log in now.' });
  } catch (e) {
    next(e);
  }
}

export async function getMe(req, res) {
  const u = req.user;
  let doctorId = null;
  if (u.role === 'doctor') {
    const d = await Doctor.findOne({ userId: u._id });
    doctorId = d?._id;
  }
  res.json({
    id: u._id,
    name: u.name,
    email: u.email,
    role: u.role,
    avatar: u.avatar,
    doctorId,
  });
}
