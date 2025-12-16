"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_service_1 = require("../application/user.service");
const router = (0, express_1.Router)();
const userService = new user_service_1.UserService();
// Получить всех пользователей
router.get('/', async (_, res) => {
    const users = await userService.getAllUsers();
    res.json(users);
});
// Создать нового пользователя
router.post('/', async (req, res) => {
    const { email, password } = req.body;
    const user = await userService.createUser(email, password);
    res.status(201).json(user);
});
// Получить пользователя по id
router.get('/:id', async (req, res) => {
    const id = Number(req.params.id);
    const user = await userService.getUserById(id);
    if (!user)
        return res.status(404).json({ message: 'User not found' });
    res.json(user);
});
// Получить избранное пользователя
router.get('/:id/favorites', async (req, res) => {
    try {
        const userId = Number(req.params.id);
        const favorites = await userService.getUserFavorites(userId);
        res.json(favorites);
    }
    catch (error) {
        console.error('Error fetching favorites:', error);
        res.status(500).json({ message: 'Failed to fetch favorites' });
    }
});
// Добавить аниме в избранное
router.post('/:id/favorites', async (req, res) => {
    try {
        const userId = Number(req.params.id);
        const { animeId } = req.body;
        if (!animeId) {
            return res.status(400).json({ message: 'animeId is required' });
        }
        const result = await userService.addToFavorites(userId, animeId);
        res.status(201).json(result);
    }
    catch (error) {
        console.error('Error adding to favorites:', error);
        res.status(500).json({ message: 'Failed to add to favorites' });
    }
});
// Удалить аниме из избранного
router.delete('/:id/favorites/:animeId', async (req, res) => {
    try {
        const userId = Number(req.params.id);
        const animeId = Number(req.params.animeId);
        await userService.removeFromFavorites(userId, animeId);
        res.status(204).send();
    }
    catch (error) {
        console.error('Error removing from favorites:', error);
        res.status(500).json({ message: 'Failed to remove from favorites' });
    }
});
// Получить рейтинги пользователя
router.get('/:id/ratings', async (req, res) => {
    try {
        const userId = Number(req.params.id);
        const ratings = await userService.getUserRatings(userId);
        res.json(ratings);
    }
    catch (error) {
        console.error('Error fetching ratings:', error);
        res.status(500).json({ message: 'Failed to fetch ratings' });
    }
});
// Добавить рейтинг
router.post('/:id/ratings', async (req, res) => {
    try {
        const userId = Number(req.params.id);
        const { animeId, score } = req.body;
        if (!animeId || !score) {
            return res.status(400).json({ message: 'animeId and score are required' });
        }
        const result = await userService.addRating(userId, animeId, score);
        res.status(201).json(result);
    }
    catch (error) {
        console.error('Error adding rating:', error);
        res.status(500).json({ message: 'Failed to add rating' });
    }
});
exports.default = router;
