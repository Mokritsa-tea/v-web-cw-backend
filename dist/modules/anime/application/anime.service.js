"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnimeService = void 0;
const data_source_1 = require("../../../shared/database/data-source");
const anime_entity_1 = require("../domain/anime.entity");
const genre_entity_1 = require("../domain/genre.entity");
class AnimeService {
    constructor() {
        this.animeRepo = data_source_1.AppDataSource.getRepository(anime_entity_1.Anime);
        this.genreRepo = data_source_1.AppDataSource.getRepository(genre_entity_1.Genre);
    }
    async createOrUpdate(data) {
        let anime = await this.animeRepo.findOne({
            where: { shikimoriId: data.shikimoriId },
            relations: ['genres'],
        });
        const genres = [];
        for (const g of data.genres) {
            let genre = await this.genreRepo.findOneBy({ name: g.name });
            if (!genre) {
                genre = this.genreRepo.create({ name: g.name });
                await this.genreRepo.save(genre);
            }
            genres.push(genre);
        }
        if (!anime) {
            anime = this.animeRepo.create({ ...data, genres });
        }
        else {
            Object.assign(anime, data, { genres });
        }
        return this.animeRepo.save(anime);
    }
    async getAll() {
        return this.animeRepo.find({ relations: ['genres'] });
    }
    async getById(id) {
        return this.animeRepo.findOne({
            where: { id },
            relations: ['genres'],
        });
    }
}
exports.AnimeService = AnimeService;
