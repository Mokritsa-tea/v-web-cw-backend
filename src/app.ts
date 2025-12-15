import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import { AppDataSource } from './shared/database/data-source';

import authRouter from './modules/auth/infrastructure/auth.controller';      
import reviewRouter from './modules/review/infrastructure/review.controller';
import userRouter from './modules/user/infrastructure/user.controller';      
import animeRouter from './modules/anime/infrastructure/anime.controller';   

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

// инициализация базы данных
AppDataSource.initialize()
  .then(() => console.log('Data Source initialized'))
  .catch((err) => console.error('DB init error', err));