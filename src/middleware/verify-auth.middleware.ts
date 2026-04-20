import { Request, Response, NextFunction } from 'express';
import { admin } from '@config/firebase.config';

export interface AuthRequest extends Request {
  user?: admin.auth.DecodedIdToken;
}

export const verifyAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split('Bearer ')[1];

  if (!token) {
    return res.status(401).json({ status: 'error', message: 'No token provided' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch {
    return res.status(401).json({ status: 'error', message: 'Invalid token' });
  }
};
