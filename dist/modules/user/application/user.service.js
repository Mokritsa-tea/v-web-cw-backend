"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const data_source_1 = require("../../../shared/database/data-source");
const user_entity_1 = require("../domain/user.entity");
const anime_entity_1 = require("../../anime/domain/anime.entity");
const bcrypt_1 = __importDefault(require("bcrypt"));
class UserService {
    constructor() {
        this.userRepo = data_source_1.AppDataSource.getRepository(user_entity_1.User);
        this.animeRepo = data_source_1.AppDataSource.getRepository(anime_entity_1.Anime);
    }
    async createUser(email, password, name) {
        const hashed = await bcrypt_1.default.hash(password, 10);
        const user = this.userRepo.create({ email, passwordHash: hashed, name });
        return this.userRepo.save(user);
    }
    async getAllUsers() {
        return this.userRepo.find();
    }
    async getUserById(id) {
        return this.userRepo.findOneBy({ id });
    }
    async getUserFavorites(userId) {
        const user = await this.userRepo.findOne({
            where: { id: userId },
            relations: ['favorites']
        });
        if (!user) {
            throw new Error('User not found');
        }
        return user.favorites;
    }
    async addToFavorites(userId, animeId) {
        const user = await this.userRepo.findOne({
            where: { id: userId },
            relations: ['favorites']
        });
        if (!user) {
            throw new Error('User not found');
        }
        const anime = await this.animeRepo.findOneBy({ id: animeId });
        if (!anime) {
            throw new Error('Anime not found');
        }
        if (!user.favorites) {
            user.favorites = [];
        }
        if (user.favorites.some(fav => fav.id === animeId)) {
            return user.favorites;
        }
        user.favorites.push(anime);
        await this.userRepo.save(user);
        return user.favorites;
    }
    async removeFromFavorites(userId, animeId) {
        const user = await this.userRepo.findOne({
            where: { id: userId },
            relations: ['favorites']
        });
        if (!user) {
            throw new Error('User not found');
        }
        user.favorites = user.favorites.filter(fav => fav.id !== animeId);
        await this.userRepo.save(user);
        return user.favorites;
    }
    async getUserRatings(userId) {
        const user = await this.userRepo.findOneBy({ id: userId });
        if (!user) {
            throw new Error('User not found');
        }
        // В реальной реализации нужно получить рейтинги из отдельной таблицы
        // Это упрощенная реализация
        return user.ratings || [];
    }
    async addRating(userId, animeId, score) {
        const user = await this.userRepo.findOneBy({ id: userId });
        if (!user) {
            throw new Error('User not found');
        }
        const anime = await this.animeRepo.findOneBy({ id: animeId });
        if (!anime) {
            throw new Error('Anime not found');
        }
        if (!user.ratings) {
            user.ratings = [];
        }
        // Обновляем рейтинг, если он уже существует
        const existingRatingIndex = user.ratings.findIndex(r => r.animeId === animeId);
        if (existingRatingIndex >= 0) {
            user.ratings[existingRatingIndex].score = score;
        }
        else {
            user.ratings.push({ animeId, score });
        }
        await this.userRepo.save(user);
        return user.ratings;
    }
}
exports.UserService = UserService;
