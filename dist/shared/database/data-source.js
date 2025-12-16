"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../modules/user/domain/user.entity");
const anime_entity_1 = require("../../modules/anime/domain/anime.entity");
const genre_entity_1 = require("../../modules/anime/domain/genre.entity");
const review_entity_1 = require("../../modules/review/domain/review.entity");
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '123',
    database: process.env.DB_NAME || 'anime_catalog',
    synchronize: true,
    logging: false,
    entities: [user_entity_1.User, anime_entity_1.Anime, genre_entity_1.Genre, review_entity_1.Review],
    migrations: [],
    subscribers: [],
});
