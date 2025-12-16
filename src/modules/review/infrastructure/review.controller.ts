import { Router, Response } from 'express';
import { ReviewService } from '../application/review.service';
import { authMiddleware, AuthRequest } from '../../../shared/middlewares/auth.middleware';

const router = Router();
const reviewService = new ReviewService();

// POST /api/reviews
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { animeId, rating, text } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const review = await reviewService.createReview(
      req.user.id,
      animeId,
      rating,
      text,
      req.user.name
    );

    res.status(201).json(review);
  } catch (err: unknown) {
    console.error('Error creating review:', err);
    if (err instanceof Error) {
      res.status(400).json({ message: err.message });
    } else {
      res.status(400).json({ message: 'Unknown error' });
    }
  }
});

// GET /api/reviews/anime/:id
router.get('/anime/:id', async (req: AuthRequest, res: Response) => {
  try {
    const animeId = Number(req.params.id);
    const reviews = await reviewService.getReviewsByAnime(animeId);
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
