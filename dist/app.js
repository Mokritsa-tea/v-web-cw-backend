"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const data_source_1 = require("./shared/database/data-source");
const auth_controller_1 = __importDefault(require("./modules/auth/infrastructure/auth.controller"));
const review_controller_1 = __importDefault(require("./modules/review/infrastructure/review.controller"));
const user_controller_1 = __importDefault(require("./modules/user/infrastructure/user.controller"));
const anime_controller_1 = __importDefault(require("./modules/anime/infrastructure/anime.controller"));
// создаём один раз
exports.app = (0, express_1.default)();
// Middleware
exports.app.use((0, cors_1.default)({
    origin: 'http://localhost:5173',
    credentials: true,
}));
exports.app.use(express_1.default.json());
// Роуты
exports.app.use('/api/auth', auth_controller_1.default);
exports.app.use('/api/reviews', review_controller_1.default);
exports.app.use('/api/users', user_controller_1.default);
exports.app.use('/api/anime', anime_controller_1.default);
// Health check
exports.app.get('/health', (_, res) => res.send('OK'));
// инициализация базы данных
data_source_1.AppDataSource.initialize()
    .then(() => console.log('Data Source initialized'))
    .catch((err) => console.error('DB init error', err));
