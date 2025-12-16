"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_service_1 = require("../application/auth.service");
const router = (0, express_1.Router)();
const authService = new auth_service_1.AuthService();
// Регистрация
router.post('/register', async (req, res) => {
    try {
        const user = await authService.register(req.body.email, req.body.password);
        res.status(201).json(user);
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
// Логин
router.post('/login', async (req, res) => {
    try {
        const result = await authService.login(req.body.email, req.body.password);
        res.json(result);
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
