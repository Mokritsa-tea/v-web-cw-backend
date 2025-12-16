import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../../modules/user/domain/user.entity';
import { Anime } from '../../modules/anime/domain/anime.entity';
import { Genre } from '../../modules/anime/domain/genre.entity';
import { Review } from '../../modules/review/domain/review.entity';
import { Favorite } from '../../modules/user/domain/favorite.entity';
import { Rating } from '../../modules/user/domain/rating.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '123',
  database: process.env.DB_NAME || 'anime_catalog',
  synchronize: true,
  logging: false,
  entities: [User, Anime, Genre, Review, Favorite, Rating],
  migrations: [],
  subscribers: [],
});
