"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const data_source_1 = require("../../../shared/database/data-source");
const user_entity_1 = require("../../user/domain/user.entity");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
class AuthService {
    constructor() {
        this.userRepo = data_source_1.AppDataSource.getRepository(user_entity_1.User);
    }
    async register(email, password) {
        const exists = await this.userRepo.findOneBy({ email });
        if (exists)
            throw new Error('User already exists');
        const hashed = await bcrypt_1.default.hash(password, 10);
        const user = this.userRepo.create({ email, passwordHash: hashed });
        return this.userRepo.save(user);
    }
    async login(email, password) {
        const user = await this.userRepo.findOneBy({ email });
        if (!user)
            throw new Error('User not found');
        const valid = await bcrypt_1.default.compare(password, user.passwordHash);
        if (!valid)
            throw new Error('Invalid password');
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
        return { user, token };
    }
}
exports.AuthService = AuthService;
