"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const review_service_1 = require("./application/review.service");
const auth_middleware_1 = require("../../shared/middlewares/auth.middleware");
const router = (0, express_1.Router)();
const reviewService = new review_service_1.ReviewService();
// Создать отзыв (только авторизованные)
router.post('/', auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        const { animeId, rating, text } = req.body;
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const review = await reviewService.createReview(req.user.id, animeId, rating, text);
        res.status(201).json(review);
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(400).json({ message: err.message });
        }
        else {
            res.status(400).json({ message: 'Unknown error' });
        }
    }
});
// Получить отзывы по аниме
router.get('/anime/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const reviews = await reviewService.getReviewsByAnime(id);
        res.json(reviews);
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(400).json({ message: err.message });
        }
        else {
            res.status(400).json({ message: 'Unknown error' });
        }
    }
});
exports.default = router;
