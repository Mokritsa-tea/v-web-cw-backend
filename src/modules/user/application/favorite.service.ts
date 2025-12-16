import { AppDataSource } from '../../../shared/database/data-source';
import { Favorite } from '../domain/favorite.entity';
import { Anime } from '../../anime/domain/anime.entity';

export class FavoriteService {
  private favoriteRepo = AppDataSource.getRepository(Favorite);
  private animeRepo = AppDataSource.getRepository(Anime);

  async getUserFavorites(userId: number) {
    const favorites = await this.favoriteRepo.find({
      where: { userId },
      relations: ['anime']
    });

    return favorites.map(favorite => favorite.animeId);
  }

  async getFavoritesWithAnime(userId: number) {
    const favorites = await this.favoriteRepo.find({
      where: { userId },
      relations: ['anime']
    });

    return favorites;
  }
}
