"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.shikimoriClient = void 0;
const axios_1 = __importDefault(require("axios"));
exports.shikimoriClient = axios_1.default.create({
    baseURL: 'https://shikimori.one/api',
    headers: {
        'User-Agent': 'anime-catalog-app',
    },
});
