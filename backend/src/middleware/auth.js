import { verifyToken } from '../utils/jwt.js';

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid authorization header' });
  }

  try {
    const token = authHeader.split(' ')[1];
    req.user = verifyToken(token);
    return next();
  } catch (_error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Admin role required' });
  }
  return next();
}
