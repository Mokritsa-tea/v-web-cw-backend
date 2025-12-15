import { Router } from 'express';
import { AuthService } from '../application/auth.service';
import { Request, Response } from 'express';

const router = Router();
const authService = new AuthService();

// Регистрация
router.post('/register', async (req: Request, res: Response) => {
  try {
    const user = await authService.register(req.body.email, req.body.password);
    res.status(201).json(user);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(400).json({ message: err.message });
    } else {
      res.status(400).json({ message: 'Unknown error' });
    }
  }
});

// Логин
router.post('/login', async (req: Request, res: Response) => {
  try {
    const result = await authService.login(req.body.email, req.body.password);
    res.json(result);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(400).json({ message: err.message });
    } else {
      res.status(400).json({ message: 'Unknown error' });
    }
  }
});

export default router;
