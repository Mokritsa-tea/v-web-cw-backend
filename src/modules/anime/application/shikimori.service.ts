import { shikimoriClient } from '../../../shared/shikimori/shikimori.client';
import { ShikimoriAnime } from './shikimori.types';

export class ShikimoriService {
  async getPopular(limit = 20): Promise<ShikimoriAnime[]> {
    const { data } = await shikimoriClient.get<ShikimoriAnime[]>('/animes', {
      params: { order: 'popularity', limit },
    });
    return data;
  }

  async getById(id: number): Promise<ShikimoriAnime> {
    const { data } = await shikimoriClient.get<ShikimoriAnime>(`/animes/${id}`);
    return data;
  }
}
