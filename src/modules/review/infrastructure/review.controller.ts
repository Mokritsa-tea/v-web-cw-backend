import { Router, Request, Response } from 'express';
import { ReviewService } from '../application/review.service';
import { authMiddleware } from '../../../shared/middlewares/auth.middleware';

const router = Router();
const reviewService = new ReviewService();

// создаём интерфейс для req с user
interface AuthRequest extends Request {
  user?: { id: number; email?: string };
}

// POST /api/reviews
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { animeId, rating, text } = req.body;
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const review = await reviewService.createReview(req.user.id, animeId, rating, text);
    res.status(201).json(review);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(400).json({ message: err.message });
    } else {
      res.status(400).json({ message: 'Unknown error' });
    }
  }
});

// GET /api/reviews/anime/:id
router.get('/anime/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const reviews = await reviewService.getReviewsByAnime(id);
    res.json(reviews);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(400).json({ message: err.message });
    } else {
      res.status(400).json({ message: 'Unknown error' });
    }
  }
});

export default router;
