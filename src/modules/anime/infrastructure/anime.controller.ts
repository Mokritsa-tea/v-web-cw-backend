import { Router, Request, Response } from 'express';
import { AnimeService } from '../application/anime.service';
import { authMiddleware } from '../../../shared/middlewares/auth.middleware';

const router = Router();
const animeService = new AnimeService();

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const anime = await animeService.getAnimeById(Number(req.params.id));
    res.json(anime);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(400).json({ message: err.message });
    } else {
      res.status(400).json({ message: 'Unknown error' });
    }
  }
});

router.post('/import/genres', authMiddleware, async (req: Request, res: Response) => {
  try {
    const genres = await animeService.importGenres();
    res.json({ message: 'Genres imported successfully', count: genres.length });
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(400).json({ message: err.message });
    } else {
      res.status(400).json({ message: 'Unknown error' });
    }
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const animeList = await animeService.getAllAnime();
    res.json(animeList);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(400).json({ message: err.message });
    } else {
      res.status(400).json({ message: 'Unknown error' });
    }
  }
});

export default router;
