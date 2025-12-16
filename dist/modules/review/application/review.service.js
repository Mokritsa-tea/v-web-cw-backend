"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewService = void 0;
const data_source_1 = require("../../../shared/database/data-source");
const review_entity_1 = require("../domain/review.entity");
const anime_entity_1 = require("../../anime/domain/anime.entity");
const user_entity_1 = require("../../user/domain/user.entity");
class ReviewService {
    constructor() {
        this.reviewRepo = data_source_1.AppDataSource.getRepository(review_entity_1.Review);
        this.animeRepo = data_source_1.AppDataSource.getRepository(anime_entity_1.Anime);
        this.userRepo = data_source_1.AppDataSource.getRepository(user_entity_1.User);
    }
    async createReview(userId, animeId, rating, text) {
        const user = await this.userRepo.findOneByOrFail({ id: userId });
        const anime = await this.animeRepo.findOneByOrFail({ id: animeId });
        // 1️⃣ сохраняем отзыв
        const review = this.reviewRepo.create({
            user,
            anime,
            rating,
            text,
        });
        await this.reviewRepo.save(review);
        // 2️⃣ пересчитываем рейтинг
        await this.recalculateAnimeRating(animeId);
        return review;
    }
    async getReviewsByAnime(animeId) {
        return this.reviewRepo.find({
            where: { anime: { id: animeId } },
            relations: ['user'],
        });
    }
    async recalculateAnimeRating(animeId) {
        const reviews = await this.reviewRepo.find({
            where: { anime: { id: animeId } },
        });
        if (reviews.length === 0)
            return;
        const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        await this.animeRepo.update(animeId, {
            ratingAvg: Number(avg.toFixed(2)),
        });
    }
}
exports.ReviewService = ReviewService;
