import { Router } from 'express';
import { AnimeService } from '../application/anime.service';
import { ShikimoriService } from '../application/shikimori.service';

const router = Router();
const animeService = new AnimeService();
const shikimoriService = new ShikimoriService();

// 🔁 Синхронизация популярных аниме
router.post('/sync/popular', async (_req, res) => {
  const list = await shikimoriService.getPopular(20);

  const saved = [];
  for (const item of list) {
    const anime = await animeService.createOrUpdate({
      shikimoriId: item.id,
      title: item.russian || item.name,
      posterUrl: item.image?.original,
      ratingAvg: Number(item.score) || 0,
      episodes: item.episodes,
      status: item.status,
      genres: item.genres ? item.genres.map((g: { russian?: string; name: string }) => ({ name: g.russian || g.name })) : [],
    });
    saved.push(anime);
  }

  res.json(saved);
});

// 🔁 Синхронизация всех аниме
router.post('/sync/all', async (_req, res) => {
  const list = await shikimoriService.getAllAnime();

  const saved = [];
  for (const item of list) {
    const anime = await animeService.createOrUpdate({
      shikimoriId: item.id,
      title: item.russian || item.name,
      posterUrl: item.image?.original,
      ratingAvg: Number(item.score) || 0,
      episodes: item.episodes,
      status: item.status,
      genres: item.genres ? item.genres.map((g: { russian?: string; name: string }) => ({ name: g.russian || g.name })) : [],
    });
    saved.push(anime);
  }

  res.json(saved);
});

// 📦 Получить популярные аниме с деталями
router.get('/popular-with-details', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const popularAnime = await shikimoriService.getAnimeWithDetails(limit);
    res.json(popularAnime);
  } catch (error) {
    console.error('Ошибка при получении популярных аниме с деталями:', error);
    res.status(500).json({ error: 'Failed to fetch popular anime with details' });
  }
});

// 📦 Получить все аниме с деталями
router.get('/all-with-details', async (_req, res) => {
  try {
    const allAnime = await shikimoriService.getAllAnimeWithDetails();
    res.json(allAnime);
  } catch (error) {
    console.error('Ошибка при получении всех аниме с деталями:', error);
    res.status(500).json({ error: 'Failed to fetch all anime with details' });
  }
});

// 📦 Получить сохранённые аниме
router.get('/', async (_req, res) => {
  const anime = await animeService.getAll();
  res.json(anime);
});

router.get('/:id', async (req, res) => {
  const anime = await animeService.getById(Number(req.params.id));
  res.json(anime);
});

export default router;
