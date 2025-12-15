import { AppDataSource } from '../../../shared/database/data-source';
import { Anime } from '../domain/anime.entity';
import { Genre } from '../domain/genre.entity';

interface CreateAnimeInput {
  shikimoriId: number;
  title: string;
  description?: string;
  posterUrl?: string;
  ratingAvg: number;
  episodes: number;
  status: string;
  genres: { name: string }[];
}

export class AnimeService {
  private animeRepo = AppDataSource.getRepository(Anime);
  private genreRepo = AppDataSource.getRepository(Genre);

  async createOrUpdate(data: CreateAnimeInput) {
    let anime = await this.animeRepo.findOne({
      where: { shikimoriId: data.shikimoriId },
      relations: ['genres'],
    });

    const genres: Genre[] = [];

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
    } else {
      Object.assign(anime, data, { genres });
    }

    return this.animeRepo.save(anime);
  }

  async getAll() {
    return this.animeRepo.find({ relations: ['genres'] });
  }

  async getById(id: number) {
    return this.animeRepo.findOne({
      where: { id },
      relations: ['genres'],
    });
  }
}
