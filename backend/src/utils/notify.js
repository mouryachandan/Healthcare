import { Notification } from '../models/Notification.js';
import { sendMail } from './mailer.js';

export async function createNotification(userId, title, message, meta) {
  return Notification.create({ userId, title, message, meta });
}

export async function notifyEmail(user, subject, html) {
  if (!user?.email) return;
  await sendMail({ to: user.email, subject, html });
}
