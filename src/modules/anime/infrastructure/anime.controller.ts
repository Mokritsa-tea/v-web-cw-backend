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
      genres: item.genres ? item.genres.map((g) => ({ name: g.russian || g.name })) : [],
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
      genres: item.genres ? item.genres.map((g) => ({ name: g.russian || g.name })) : [],
    });
    saved.push(anime);
  }

  res.json(saved);
});

// 🔁 Синхронизация аниме с жанрами
router.post('/sync/with-genres', async (_req, res) => {
  const list = await shikimoriService.getAnimeWithGenres();

  const saved = [];
  for (const item of list) {
    const anime = await animeService.createOrUpdate({
      shikimoriId: item.id,
      title: item.russian || item.name,
      posterUrl: item.image?.original,
      ratingAvg: Number(item.score) || 0,
      episodes: item.episodes,
      status: item.status,
      genres: item.genres ? item.genres.map((g) => ({ name: g.russian || g.name })) : [],
    });
    saved.push(anime);
  }

  res.json(saved);
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
