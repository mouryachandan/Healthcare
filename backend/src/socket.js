import { Server } from 'socket.io';
import { verifyToken } from './utils/jwt.js';
import { Message } from './models/Message.js';

export function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace('Bearer ', '');
      if (!token) return next(new Error('Unauthorized'));
      const decoded = verifyToken(token);
      socket.userId = decoded.id;
      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    const uid = socket.userId;
    socket.join(`user:${uid}`);

    socket.on('chat:send', async ({ toUserId, body }, cb) => {
      try {
        if (!toUserId || !body?.trim()) {
          cb?.({ error: 'Invalid message' });
          return;
        }
        const msg = await Message.create({
          fromUserId: uid,
          toUserId,
          body: body.trim(),
        });
        io.to(`user:${toUserId}`).emit('chat:message', msg);
        socket.emit('chat:message', msg);
        cb?.({ ok: true, message: msg });
      } catch (e) {
        cb?.({ error: e.message });
      }
    });
  });

  return io;
}
