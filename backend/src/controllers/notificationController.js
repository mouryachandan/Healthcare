import { Notification } from '../models/Notification.js';

export async function myNotifications(req, res, next) {
  try {
    const list = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(list);
  } catch (e) {
    next(e);
  }
}

export async function markRead(req, res, next) {
  try {
    await Notification.updateMany(
      { userId: req.user._id, read: false },
      { $set: { read: true } }
    );
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
}
