import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

// Интерфейс Request с user
interface AuthRequest extends Request {
  user?: { id: number; email?: string };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });

  const token = authHeader.split(' ')[1];
  try {
    // Типизируем декодированный токен
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload & { id: number; email?: string };

    req.user = { id: decoded.id, email: decoded.email }; // безопасная типизация
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
