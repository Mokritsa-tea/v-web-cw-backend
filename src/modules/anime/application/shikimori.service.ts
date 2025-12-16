import axios from 'axios';
import { Anime } from '../domain/anime.entity';
import { Genre } from '../domain/genre.entity';
import { AppDataSource } from '../../../shared/database/data-source';

export class ShikimoriService {
  private readonly API_URL = 'https://shikimori.one/api';
  private animeRepo = AppDataSource.getRepository(Anime);
  private genreRepo = AppDataSource.getRepository(Genre);

  async fetchPopularAnimeIds(limit: number = 10): Promise<number[]> {
    try {
      const response = await axios.get(`${this.API_URL}/animes`, {
        params: { limit, order: 'ranked' }
      });
      return response.data.map((anime: any) => anime.id);
    } catch (err) {
      console.error('Ошибка при получении популярных ID аниме:', err);
      return [1225, 1168, 1279, 1296, 1310, 1327, 1334, 1349];
    }
  }

  async fetchAnime(id: number): Promise<Anime> {
    try {
      const existingAnime = await this.animeRepo.findOne({ where: { shikimoriId: id } });
      if (existingAnime) {
        console.log(`Аниме с shikimoriId ${id} уже существует.`);
        return existingAnime;
      }

      const response = await axios.get(`${this.API_URL}/animes/${id}`);
      const animeData = response.data;

      const ratingAvg = animeData.rating ? Number(animeData.rating) : 0;

      const anime = this.animeRepo.create({
        shikimoriId: animeData.id,
        title: animeData.name,
        posterUrl: animeData.image?.original,
        ratingAvg: isNaN(ratingAvg) ? 0 : ratingAvg,
        episodes: animeData.episodes || 0,
        status: animeData.status || 'unknown',
        description: animeData.description || '',
      });

      return this.animeRepo.save(anime);
    } catch (err: any) {
      if (err.response?.status === 404) {
        console.log(`Аниме с ID ${id} не найдено в API. Пропускаем.`);
        throw new Error(`Аниме с ID ${id} не найдено`);
      }
      console.error('Ошибка при получении аниме:', err.message);
      throw err;
    }
  }

  async fetchAnimeWithGenres(id: number, retries = 3, delay = 1000): Promise<Anime> {
    try {
      const anime = await this.fetchAnime(id);

      const existingAnimeWithGenres = await this.animeRepo.findOne({
        where: { shikimoriId: id },
        relations: ['genres']
      });

      if (existingAnimeWithGenres) {
        anime.id = existingAnimeWithGenres.id;
        console.log(`Аниме с shikimoriId ${id} уже существует. Обновляем связи с жанрами.`);

        const apiGenres = await this.fetchAnimeGenresWithRetry(id, retries, delay);

        if (apiGenres.length > 0) {
          console.log(`Найдено ${apiGenres.length} жанров для аниме с ID ${anime.id}. Обновляем связи...`);
          anime.genres = apiGenres;
          const updatedAnime = await this.animeRepo.save(anime);
          return updatedAnime;
        } else {
          console.log(`Жанры для аниме с ID ${id} не найдены в API. Используем существующие.`);
          return existingAnimeWithGenres;
        }
      }

      const genres = await this.fetchAnimeGenresWithRetry(id, retries, delay);
      if (genres.length > 0) {
        console.log(`Связываем ${genres.length} жанров с аниме с ID ${anime.id}`);
        anime.genres = genres;
        return this.animeRepo.save(anime);
      } else {
        console.log(`Жанры для аниме с ID ${anime.id} не найдены. Сохраняем аниме без жанров.`);
        return anime;
      }
    } catch (err) {
      console.error('Ошибка в fetchAnimeWithGenres:', err instanceof Error ? err.message : String(err));
      throw err;
    }
  }

  async updateGenreRelationsForAnime(animeId: number): Promise<void> {
    try {
      const anime = await this.animeRepo.findOne({ where: { id: animeId }, relations: ['genres'] });
      if (!anime) {
        console.log(`Аниме с ID ${animeId} не найдено.`);
        return;
      }

      const genres = await this.fetchAnimeGenresWithRetry(anime.shikimoriId);
      if (genres.length > 0) {
        console.log(`Обновляем связи жанров для аниме с ID ${animeId}. Найдено ${genres.length} жанров.`);
        anime.genres = genres;
        await this.animeRepo.save(anime);
        console.log(`Связи жанров успешно обновлены для аниме с ID ${animeId}.`);
      } else {
        console.log(`Жанры для аниме с ID ${animeId} не найдены.`);
      }
    } catch (err) {
      console.error(`Ошибка при обновлении связей жанров для аниме с ID ${animeId}:`, err instanceof Error ? err.message : String(err));
    }
  }

  async fetchAnimeGenresWithRetry(animeId: number, retries = 3, delay = 1000): Promise<Genre[]> {
    try {
      return await this.fetchAnimeGenres(animeId);
    } catch (err: any) {
      if (err.response?.status === 404) {
        console.log(`Жанры для аниме с ID ${animeId} не найдены в API.`);
        return [];
      }
      if (err.response?.status === 429 && retries > 0) {
        console.log(`Лимит запросов исчерпан. Повторная попытка через ${delay}мс... (осталось попыток: ${retries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.fetchAnimeGenresWithRetry(animeId, retries - 1, delay * 2);
      }
      console.error(`Ошибка при получении жанров для аниме с ID ${animeId}:`, err.message);
      return [];
    }
  }

  async fetchGenres(): Promise<Genre[]> {
    try {
      const response = await axios.get(`${this.API_URL}/genres?type=anime`);
      const genresData = response.data;

      // Удаляем дубликаты жанров на уровне импорта
      const uniqueGenresData = genresData.filter((genre: any, index: number, self: any[]) =>
        index === self.findIndex((t: any) => (
          t.id === genre.id && t.name === genre.name && t.russian === genre.russian
        ))
      );

      const existingGenres = await this.genreRepo.find();
      const existingGenreIds = existingGenres.map(genre => genre.id);

      // Фильтруем только те жанры, которых еще нет в базе
      const newGenresData = uniqueGenresData.filter((genre: any) => !existingGenreIds.includes(genre.id));

      if (newGenresData.length > 0) {
        const newGenres = newGenresData.map((genre: any) => {
          return this.genreRepo.create({
            id: genre.id,
            name: genre.name,
            russian: genre.russian,
          });
        });
        const savedGenres = await this.genreRepo.save(newGenres);
        console.log(`Добавлено ${savedGenres.length} новых уникальных жанров.`);
        return [...existingGenres, ...savedGenres];
      }
      console.log(`Все жанры уже существуют в базе данных или являются дубликатами.`);
      return existingGenres;
    } catch (err: any) {
      console.error('Ошибка при получении жанров:', err.message);
      return [];
    }
  }

  async fetchAnimeGenres(animeId: number): Promise<Genre[]> {
    try {
      const response = await axios.get(`${this.API_URL}/animes/${animeId}/genres`);
      const genreData = response.data;

      if (!genreData || genreData.length === 0) {
        console.log(`Жанры для аниме с ID ${animeId} не найдены в API.`);
        return [];
      }

      const genreIds = genreData.map((genre: any) => genre.id);
      const genres = await this.genreRepo.findByIds(genreIds);

      // Убедимся, что все жанры существуют в базе данных
      if (genres.length < genreIds.length) {
        console.warn(`Не все жанры найдены в базе данных для аниме ${animeId}. Попробуем добавить недостающие.`);

        // Получаем все жанры из API и добавляем недостающие в базу
        const allGenresFromApi = genreData.map((genre: any) => genre);
        const existingGenreIds = genres.map(g => g.id);

        const missingGenres = allGenresFromApi.filter((genre: any) => !existingGenreIds.includes(genre.id));

        if (missingGenres.length > 0) {
          const newGenres = missingGenres.map((genre: any) => {
            return this.genreRepo.create({
              id: genre.id,
              name: genre.name,
              russian: genre.russian,
            });
          });
          const savedMissingGenres = await this.genreRepo.save(newGenres);
          console.log(`Добавлено ${savedMissingGenres.length} недостающих жанров для аниме ${animeId}.`);

          // Обновляем список жанров с добавленными
          const updatedGenres = await this.genreRepo.findByIds(genreIds);
          return updatedGenres;
        }
      }

      return genres;
    } catch (err: any) {
      if (err.response?.status === 404) {
        console.log(`Жанры для аниме с ID ${animeId} не найдены в API.`);
        return [];
      }
      console.error(`Ошибка при получении жанров для аниме с ID ${animeId}:`, err.message);
      return [];
    }
  }

  async cleanUpDuplicateGenresInDatabase(): Promise<void> {
    try {
      console.log('Начинаем очистку дублирующихся жанров в базе данных...');

      // Получаем все жанры из базы
      const allGenres = await this.genreRepo.find();

      // Группируем жанры по уникальным комбинациям name и russian
      const genreMap = new Map<string, Genre[]>();
      allGenres.forEach(genre => {
        const key = `${genre.name}|${genre.russian || ''}`;
        if (!genreMap.has(key)) {
          genreMap.set(key, []);
        }
        genreMap.get(key)!.push(genre);
      });

      // Находим жанры с дубликатами
      const duplicates = Array.from(genreMap.entries()).filter(([_, genres]) => genres.length > 1);

      if (duplicates.length === 0) {
        console.log('Дублирующихся жанров в базе данных не найдено.');
        return;
      }

      console.log(`Найдено ${duplicates.length} групп дублирующихся жанров.`);

      // Обрабатываем каждую группу дубликатов
      for (const [key, genres] of duplicates) {
        console.log(`Обрабатываем дубликаты для жанра: ${key}`);

        // Оставляем один жанр, удаляем остальные
        const genreToKeep = genres[0];
        const genresToRemove = genres.slice(1);

        for (const genre of genresToRemove) {
          try {
            // Удаляем связи жанра с аниме
            genre.anime = [];
            await this.genreRepo.save(genre);

            // Удаляем жанр
            await this.genreRepo.remove(genre);
            console.log(`Удален дубликат жанра с ID: ${genre.id}`);
          } catch (err) {
            console.error(`Ошибка при удалении жанра с ID ${genre.id}:`, err);
          }
        }
      }

      console.log('Очистка дублирующихся жанров в базе данных завершена.');
    } catch (err) {
      console.error('Ошибка при очистке дублирующихся жанров:', err);
    }
  }
}
