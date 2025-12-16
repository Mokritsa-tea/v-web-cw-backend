import { Router, Request, Response } from 'express';
import { UserService } from '../application/user.service';
import { authMiddleware, AuthRequest } from '../../../shared/middlewares/auth.middleware';
import { FavoriteService } from '../application/favorite.service';

const router = Router();
const userService = new UserService();
const favoriteService = new FavoriteService();

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const user = await userService.getUserById(Number(req.params.id));
    res.json(user);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(400).json({ message: err.message });
    } else {
      res.status(400).json({ message: 'Unknown error' });
    }
  }
});

router.patch('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = Number(req.params.id);
    const { name } = req.body;

    if (!req.user || req.user.id !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const updatedUser = await userService.updateUser(userId, { name });
    res.json(updatedUser);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(400).json({ message: err.message });
    } else {
      res.status(400).json({ message: 'Unknown error' });
    }
  }
});

router.get('/:id/favorites', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = Number(req.params.id);

    if (!req.user || req.user.id !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const favorites = await favoriteService.getFavoritesWithAnime(userId);
    res.json(favorites);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(400).json({ message: err.message });
    } else {
      res.status(400).json({ message: 'Unknown error' });
    }
  }
});

export default router;
