import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import { AppDataSource } from './shared/database/data-source';
import authRouter from './modules/auth/infrastructure/auth.controller';
import reviewRouter from './modules/review/infrastructure/review.controller';
import userRouter from './modules/user/infrastructure/user.controller';
import animeRouter from './modules/anime/infrastructure/anime.controller';
import { AnimeService } from './modules/anime/application/anime.service';
import { ShikimoriService } from './modules/anime/application/shikimori.service';

// создаём один раз
export const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());

// Роуты
app.use('/api/auth', authRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/users', userRouter);
app.use('/api/anime', animeRouter);

// Health check
app.get('/health', (_, res) => res.send('OK'));

// Инициализация базы данных и импорт данных
AppDataSource.initialize()
  .then(async () => {
    console.log('Data Source initialized');

    const shikimoriService = new ShikimoriService();
    const animeService = new AnimeService();

    // Очищаем дублирующиеся жанры в базе данных
    console.log('Проверяем и очищаем дублирующиеся жанры в базе данных...');
    await shikimoriService.cleanUpDuplicateGenresInDatabase();

    // Импортируем жанры и аниме
    console.log('Начинаем импорт жанров...');
    await animeService.importGenres();

    // Проверяем и добавляем жанры, если их меньше 3
    console.log('Проверяем количество жанров для каждого аниме...');
    await animeService.ensureMinimumGenres(3);

    console.log('Все аниме имеют минимум 3 уникальных жанров и база данных очищена от дубликатов.');
    console.log('Импорт данных завершён.');
  })
  .catch((err) => console.error('DB init error', err));
