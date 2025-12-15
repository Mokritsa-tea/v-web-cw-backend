import { AppDataSource } from '../../../shared/database/data-source';
import { Anime } from '../domain/anime.entity';
import { Genre } from '../domain/genre.entity';

export class AnimeService {
  private animeRepo = AppDataSource.getRepository(Anime);
  private genreRepo = AppDataSource.getRepository(Genre);

  async createAnime(data: Partial<Anime>) {
    const genres: Genre[] = [];

    if (data.genres) {
      for (const g of data.genres) {
        let genre = await this.genreRepo.findOneBy({ name: g.name });
        if (!genre) {
          genre = this.genreRepo.create({ name: g.name });
          await this.genreRepo.save(genre);
        }
        genres.push(genre);
      }
    }

    const anime = this.animeRepo.create({
      ...data,
      genres,
    });

    return this.animeRepo.save(anime);
  }

  async getAllAnime() {
    return this.animeRepo.find({ relations: ['genres'] });
  }

  async getAnimeById(id: number) {
    return this.animeRepo.findOne({
      where: { id },
      relations: ['genres'],
    });
  }
}
