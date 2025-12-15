import { Router } from 'express';
import { ShikimoriService } from '../application/shikimori.service';

const router = Router();
const shikimoriService = new ShikimoriService();

// Получить популярные аниме
router.get('/popular', async (_req, res) => {
  const anime = await shikimoriService.getPopular();
  res.json(anime);
});

// Получить аниме по ID
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const anime = await shikimoriService.getById(id);
  res.json(anime);
});

export default router;
