import { shikimoriClient } from '../../../shared/shikimori/shikimori.client';
import { ShikimoriAnime } from './shikimori.types';

export class ShikimoriService {
  async getPopular(limit = 20): Promise<ShikimoriAnime[]> {
    try {
      const { data } = await shikimoriClient.get<ShikimoriAnime[]>('/animes', {
        params: {
          order: 'popularity',
          limit,
          status: 'released'
        },
      });

      console.log(`ShikimoriService.getPopular: получено ${data.length} аниме`);

      // Логируем структуру первого аниме для отладки
      if (data.length > 0) {
        const first = data[0];
        console.log('Первое аниме в ответе:');
        console.log('- ID:', first.id);
        console.log('- Название:', first.name);
        console.log('- Есть поле genres?:', 'genres' in first);
        console.log('- Genres тип:', typeof first.genres);
        console.log('- Genres значение:', first.genres);
      }

      return data;
    } catch (error) {
      console.error('ShikimoriService.getPopular ошибка:', error);
      return [];
    }
  }

  async getAllAnime(): Promise<ShikimoriAnime[]> {
    try {
      const allAnime: ShikimoriAnime[] = [];
      let page = 1;
      const limit = 50;
      let hasMore = true;

      while (hasMore) {
        const { data } = await shikimoriClient.get<ShikimoriAnime[]>('/animes', {
          params: {
            page,
            limit,
            order: 'popularity'
          },
        });

        console.log(`Получено ${data.length} аниме с страницы ${page}`);

        if (data.length === 0) {
          hasMore = false;
        } else {
          allAnime.push(...data);
          page++;

          // Ограничение на количество страниц для тестирования
          if (page > 5) {
            hasMore = false;
            console.log('Ограничение: обработано 5 страниц');
          }
        }
      }

      console.log(`ShikimoriService.getAllAnime: получено ${allAnime.length} аниме`);
      return allAnime;
    } catch (error) {
      console.error('ShikimoriService.getAllAnime ошибка:', error);
      return [];
    }
  }

  async getAnimeWithGenres(): Promise<ShikimoriAnime[]> {
    try {
      const allAnime: ShikimoriAnime[] = [];
      let page = 1;
      const limit = 50;
      let hasMore = true;

      while (hasMore) {
        const { data } = await shikimoriClient.get<ShikimoriAnime[]>('/animes', {
          params: {
            page,
            limit,
            order: 'popularity'
          },
        });

        console.log(`Получено ${data.length} аниме с страницы ${page}`);

        if (data.length === 0) {
          hasMore = false;
        } else {
          // Для каждого аниме получаем полную информацию с жанрами
          for (const anime of data) {
            try {
              const fullAnime = await this.getById(anime.id);
              if (fullAnime) {
                allAnime.push(fullAnime);
              }
            } catch (error) {
              console.error(`Не удалось получить полную информацию для аниме ${anime.id}:`, error);
            }
          }

          page++;

          // Ограничение на количество страниц для тестирования
          if (page > 2) {
            hasMore = false;
            console.log('Ограничение: обработано 2 страницы');
          }
        }
      }

      console.log(`ShikimoriService.getAnimeWithGenres: получено ${allAnime.length} аниме с жанрами`);
      return allAnime;
    } catch (error) {
      console.error('ShikimoriService.getAnimeWithGenres ошибка:', error);
      return [];
    }
  }

  async getById(id: number): Promise<ShikimoriAnime | null> {
    try {
      const { data } = await shikimoriClient.get<ShikimoriAnime>(`/animes/${id}`);
      console.log(`Получено аниме ${id}:`, JSON.stringify(data.genres, null, 2));
      return data;
    } catch (error) {
      console.error(`ShikimoriService.getById ошибка для id=${id}:`, error);
      return null;
    }
  }
}
