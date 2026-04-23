import { verifyToken } from '../utils/jwt.js';
import { User } from '../models/User.js';

export function protect() {
  return async (req, res, next) => {
    try {
      let token;
      const h = req.headers.authorization;
      if (h?.startsWith('Bearer ')) token = h.slice(7);
      if (!token)
        return res.status(401).json({ message: 'Not authorized, no token' });
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id);
      if (!user || user.isBlocked)
        return res.status(401).json({ message: 'User not found or blocked' });
      req.user = user;
      next();
    } catch {
      res.status(401).json({ message: 'Not authorized, invalid token' });
    }
  };
}

export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });
    if (!roles.includes(req.user.role))
      return res.status(403).json({ message: 'Forbidden for this role' });
    next();
  };
}
