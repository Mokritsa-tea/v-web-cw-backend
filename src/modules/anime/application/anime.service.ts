import { AppDataSource } from '../../../shared/database/data-source';
import { Anime } from '../domain/anime.entity';
import { Genre } from '../domain/genre.entity';
import { ShikimoriService } from './shikimori.service';
import { In } from 'typeorm';

export class AnimeService {
  private animeRepo = AppDataSource.getRepository(Anime);
  private genreRepo = AppDataSource.getRepository(Genre);
  private shikimoriService = new ShikimoriService();

  async getAnimeById(id: number) {
    const anime = await this.animeRepo.findOne({
      where: { id },
      relations: ['genres']
    });

    if (!anime) {
      try {
        const fetchedAnime = await this.shikimoriService.fetchAnime(id);
        const genres = await this.shikimoriService.fetchAnimeGenres(id);
        fetchedAnime.genres = genres || [];
        const savedAnime = await this.animeRepo.save(fetchedAnime);
        return this.transformAnime(savedAnime);
      } catch (err) {
        console.error(`Ошибка при получении аниме с ID ${id}:`, err instanceof Error ? err.message : String(err));
        throw err;
      }
    }
    return this.transformAnime(anime);
  }

  async ensureMinimumGenres(minGenres: number = 3) {
    try {
      console.log(`Начинаем проверку и добавление жанров для всех аниме (минимум ${minGenres} жанров)...`);
      const animeList = await this.animeRepo.find({ relations: ['genres'] });
      const allGenres = await this.genreRepo.find();

      for (const anime of animeList) {
        const currentGenres = anime.genres || [];
        const uniqueCurrentGenres = [...new Map(currentGenres.map(genre => [genre.id, genre])).values()];
        const currentUniqueGenreIds = uniqueCurrentGenres.map(g => g.id);

        if (uniqueCurrentGenres.length >= minGenres) {
          console.log(`Аниме с ID ${anime.id} уже имеет ${uniqueCurrentGenres.length} уникальных жанров. Пропускаем.`);
          continue;
        }

        const availableGenres = allGenres.filter(g => !currentUniqueGenreIds.includes(g.id));

        if (availableGenres.length === 0) {
          console.log(`Нет доступных жанров для аниме с ID ${anime.id}. Оставляем существующие.`);
          continue;
        }

        const neededGenresCount = minGenres - uniqueCurrentGenres.length;
        const selectedGenres = this.getRandomGenres(availableGenres, neededGenresCount);

        anime.genres = [...uniqueCurrentGenres, ...selectedGenres];
        await this.animeRepo.save(anime);

        console.log(`Аниме с ID ${anime.id} получило ${selectedGenres.length} новых жанров. Всего уникальных жанров: ${minGenres}`);
      }
      console.log(`Гарантировано, что у всех аниме минимум ${minGenres} уникальных жанров.`);
      return true;
    } catch (err) {
      console.error(`Ошибка при обеспечении минимального количества жанров:`, err instanceof Error ? err.message : String(err));
      return false;
    }
  }

  async importGenres() {
    console.log('Начинаем импорт жанров...');
    const genres = await this.shikimoriService.fetchGenres();
    console.log(`Успешно импортировано ${genres.length} жанров.`);

    console.log('Получаем популярные ID аниме...');
    const popularAnimeIds = await this.shikimoriService.fetchPopularAnimeIds(8);
    console.log(`Получено популярных ID аниме: ${popularAnimeIds.join(', ')}`);

    for (const id of popularAnimeIds) {
      try {
        console.log(`\nОбрабатываем аниме с ID: ${id}`);
        const anime = await this.shikimoriService.fetchAnimeWithGenres(id);
        console.log(`Успешно обработано аниме с shikimoriId: ${anime.shikimoriId}. Жанров связано: ${anime.genres ? anime.genres.length : 0}`);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        if (errorMessage.includes('не найдено')) {
          console.log(`Аниме с ID ${id} не найдено в базе или API. Пропускаем.`);
        } else {
          console.error(`Ошибка при обработке аниме с ID ${id}:`, errorMessage);
        }
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    console.log('Импорт жанров и аниме завершён.');
    return genres;
  }

  async updateAllAnimeGenreRelations() {
    console.log('Начинаем обновление связей жанров для всех аниме...');
    const animeList = await this.getAllAnime();
    console.log(`Найдено ${animeList.length} аниме для обновления связей.`);

    for (const anime of animeList) {
      try {
        console.log(`\nОбновляем связи жанров для аниме с ID: ${anime.id} (shikimoriId: ${anime.shikimoriId})`);
        await this.shikimoriService.updateGenreRelationsForAnime(anime.id);
      } catch (err) {
        console.error(`Ошибка при обновлении связей для аниме с ID ${anime.id}:`, err instanceof Error ? err.message : String(err));
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    console.log('Обновление связей жанров для всех аниме завершено.');
  }

  async manuallyLinkGenresToAnime(animeShikimoriId: number, genreIds: number[]) {
    try {
      const anime = await this.animeRepo.findOne({ where: { shikimoriId: animeShikimoriId } });
      if (!anime) {
        console.error(`Аниме с shikimoriId ${animeShikimoriId} не найдено.`);
        return false;
      }

      const genres = await this.genreRepo.findByIds(genreIds);
      if (genres.length !== genreIds.length) {
        console.error(`Не все жанры найдены в базе данных. Найдено ${genres.length} из ${genreIds.length}.`);
        return false;
      }

      const uniqueGenres = [...new Map(genres.map(genre => [genre.id, genre])).values()];
      anime.genres = uniqueGenres;
      const updatedAnime = await this.animeRepo.save(anime);
      console.log(`Успешно связано ${updatedAnime.genres.length} уникальных жанров с аниме с ID ${updatedAnime.id}.`);
      return true;
    } catch (err) {
      console.error(`Ошибка при ручном связывании жанров с аниме:`, err instanceof Error ? err.message : String(err));
      return false;
    }
  }

  async assignRandomGenresToAnime(minGenres: number = 3) {
    try {
      const animeList = await this.animeRepo.find();
      const genres = await this.genreRepo.find();
      console.log(`Найдено ${animeList.length} аниме и ${genres.length} жанров для случайного распределения.`);

      for (const anime of animeList) {
        const currentGenres = anime.genres || [];
        const uniqueCurrentGenres = [...new Map(currentGenres.map(genre => [genre.id, genre])).values()];
        const existingGenreIds = uniqueCurrentGenres.map(g => g.id);

        if (uniqueCurrentGenres.length >= minGenres) {
          console.log(`Аниме с ID ${anime.id} уже имеет ${uniqueCurrentGenres.length} уникальных жанров. Пропускаем.`);
          continue;
        }

        const availableGenres = genres.filter(g => !existingGenreIds.includes(g.id));

        if (availableGenres.length === 0) {
          console.log(`Нет доступных жанров для аниме с ID ${anime.id}. Оставляем существующие.`);
          continue;
        }

        const neededGenresCount = minGenres - uniqueCurrentGenres.length;
        const selectedGenres = this.getRandomGenres(availableGenres, neededGenresCount);

        anime.genres = [...uniqueCurrentGenres, ...selectedGenres];
        await this.animeRepo.save(anime);

        console.log(`Аниме с ID ${anime.id} получило ${selectedGenres.length} новых жанров. Всего уникальных жанров: ${minGenres}`);
      }
      console.log('Случайное распределение жанров завершено.');
      return true;
    } catch (err) {
      console.error(`Ошибка при случайном распределении жанров:`, err instanceof Error ? err.message : String(err));
      return false;
    }
  }

  async cleanUpDuplicateGenres() {
    try {
      console.log('Начинаем очистку дублирующихся жанров для всех аниме...');
      const animeList = await this.animeRepo.find({ relations: ['genres'] });

      for (const anime of animeList) {
        if (!anime.genres || anime.genres.length <= 1) {
          console.log(`Аниме с ID ${anime.id} не имеет дублирующихся жанров или имеет только один жанр. Пропускаем.`);
          continue;
        }

        const uniqueGenres = [...new Map(anime.genres.map(genre => [genre.id, genre])).values()];

        if (uniqueGenres.length !== anime.genres.length) {
          console.log(`Найдены дубликаты жанров для аниме с ID ${anime.id}. Удаляем дубликаты...`);
          anime.genres = uniqueGenres;
          await this.animeRepo.save(anime);
          console.log(`Очищено до ${anime.genres.length} уникальных жанров для аниме с ID ${anime.id}.`);
        } else {
          console.log(`Аниме с ID ${anime.id} не имеет дублирующихся жанров.`);
        }
      }
      console.log('Очистка дублирующихся жанров завершена.');
      return true;
    } catch (err) {
      console.error(`Ошибка при очистке дублирующихся жанров:`, err instanceof Error ? err.message : String(err));
      return false;
    }
  }

  async getAllAnime() {
    const animeList = await this.animeRepo.find({
      relations: ['genres']
    });
    return animeList.map(anime => this.transformAnime(anime));
  }

  async getAnimeGenres(animeId: number): Promise<Genre[]> {
    const anime = await this.animeRepo.findOne({
      where: { id: animeId },
      relations: ['genres']
    });
    return anime ? anime.genres || [] : [];
  }

  async getAllGenres(): Promise<Genre[]> {
    return this.genreRepo.find();
  }

  private getRandomGenres(genres: Genre[], count: number): Genre[] {
    const shuffled = [...genres].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  private transformAnime(anime: Anime) {
    const uniqueGenres = [...new Map(anime.genres?.map(genre => [genre.id, genre]) || []).values()];
    return {
      id: anime.id,
      shikimoriId: anime.shikimoriId,
      title: anime.title,
      posterUrl: anime.posterUrl,
      ratingAvg: anime.ratingAvg,
      episodes: anime.episodes,
      status: anime.status,
      description: anime.description,
      genres: uniqueGenres.map(genre => ({
        id: genre.id,
        name: genre.name,
        russian: genre.russian
      }))
    };
  }
}
