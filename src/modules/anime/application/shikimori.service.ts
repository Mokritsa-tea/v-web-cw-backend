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

  async getAnimeWithDetails(limit: number = 20): Promise<ShikimoriAnime[]> {
    try {
      const { data: popularAnime } = await shikimoriClient.get<ShikimoriAnime[]>('/animes', {
        params: {
          order: 'popularity',
          limit,
          status: 'released'
        },
      });

      const detailedAnime: ShikimoriAnime[] = [];

      for (const anime of popularAnime) {
        try {
          const fullAnime = await this.getById(anime.id);
          if (fullAnime) {
            detailedAnime.push(fullAnime);
          }
        } catch (error) {
          console.error(`Не удалось получить детали для аниме ${anime.id}:`, error);
          detailedAnime.push(anime);
        }
      }

      console.log(`ShikimoriService.getAnimeWithDetails: получено ${detailedAnime.length} аниме с деталями`);
      return detailedAnime;
    } catch (error) {
      console.error('ShikimoriService.getAnimeWithDetails ошибка:', error);
      return [];
    }
  }

  async getAllAnimeWithDetails(): Promise<ShikimoriAnime[]> {
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
          for (const anime of data) {
            try {
              const fullAnime = await this.getById(anime.id);
              if (fullAnime) {
                allAnime.push(fullAnime);
              } else {
                allAnime.push(anime);
              }
            } catch (error) {
              console.error(`Не удалось получить детали для аниме ${anime.id}:`, error);
              allAnime.push(anime);
            }
          }

          page++;

          // Ограничение на количество страниц для тестирования
          if (page > 5) {
            hasMore = false;
            console.log('Ограничение: обработано 5 страниц');
          }
        }
      }

      console.log(`ShikimoriService.getAllAnimeWithDetails: получено ${allAnime.length} аниме с деталями`);
      return allAnime;
    } catch (error) {
      console.error('ShikimoriService.getAllAnimeWithDetails ошибка:', error);
      return [];
    }
  }

  async getById(id: number): Promise<ShikimoriAnime> {
    try {
      const { data } = await shikimoriClient.get<ShikimoriAnime>(`/animes/${id}`);

      // Добавляем описание, если его нет в ответе
      const response = {
        ...data,
        description: data.description || data.russian || 'Нет описания',
        genres: data.genres || []
      };

      console.log(`Получено аниме ${id} с деталями:`, {
        title: response.name,
        description: response.description,
        genres: response.genres.map(g => g.name)
      });

      return response;
    } catch (error) {
      console.error(`ShikimoriService.getById ошибка для id=${id}:`, error);
      return {
        id,
        name: 'Unknown',
        russian: 'Неизвестно',
        image: undefined,
        score: 'N/A',
        episodes: 0,
        status: 'unknown',
        description: 'Нет информации об аниме',
        genres: []
      };
    }
  }
}
