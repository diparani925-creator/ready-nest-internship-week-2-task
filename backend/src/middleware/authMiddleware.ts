import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthUser {
  id: string;
  role: 'student' | 'admin';
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1]; // Format: "Bearer <token>"

    if (!token) {
       res.status(401).json({ message: 'Authentication token missing' });
       return;
    }

    const secret = process.env.JWT_SECRET || 'smart_campus_secret_key_2026_gemini';

    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
         res.status(403).json({ message: 'Token is invalid or expired' });
         return;
      }

      req.user = decoded as AuthUser;
      next();
    });
  } else {
     res.status(401).json({ message: 'Authorization header missing' });
     return;
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
     res.status(401).json({ message: 'Unauthorized' });
     return;
  }

  if (req.user.role !== 'admin') {
     res.status(403).json({ message: 'Access denied: Administrator role required' });
     return;
  }

  next();
};
