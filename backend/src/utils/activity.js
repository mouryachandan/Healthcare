import { ActivityLog } from '../models/ActivityLog.js';

export async function logActivity({
  actorId,
  action,
  entity,
  entityId,
  details,
  ip,
}) {
  try {
    await ActivityLog.create({
      actorId,
      action,
      entity,
      entityId,
      details,
      ip,
    });
  } catch (e) {
    console.error('activity log', e.message);
  }
}
