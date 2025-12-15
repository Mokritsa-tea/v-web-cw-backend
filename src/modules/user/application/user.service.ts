import { AppDataSource } from '../../../shared/database/data-source';
import { User } from '../domain/user.entity';
import { Anime } from '../../anime/domain/anime.entity';
import bcrypt from 'bcrypt';

export class UserService {
  private userRepo = AppDataSource.getRepository(User);
  private animeRepo = AppDataSource.getRepository(Anime);

  async createUser(email: string, password: string, name?: string) {
    const hashed = await bcrypt.hash(password, 10);
    const user = this.userRepo.create({ email, passwordHash: hashed, name });
    return this.userRepo.save(user);
  }

  async getAllUsers() {
    return this.userRepo.find();
  }

  async getUserById(id: number) {
    return this.userRepo.findOneBy({ id });
  }

  async getUserFavorites(userId: number) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['favorites']
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user.favorites;
  }

  async addToFavorites(userId: number, animeId: number) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['favorites']
    });

    if (!user) {
      throw new Error('User not found');
    }

    const anime = await this.animeRepo.findOneBy({ id: animeId });

    if (!anime) {
      throw new Error('Anime not found');
    }

    if (!user.favorites) {
      user.favorites = [];
    }

    if (user.favorites.some(fav => fav.id === animeId)) {
      return user.favorites;
    }

    user.favorites.push(anime);
    await this.userRepo.save(user);

    return user.favorites;
  }

  async removeFromFavorites(userId: number, animeId: number) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['favorites']
    });

    if (!user) {
      throw new Error('User not found');
    }

    user.favorites = user.favorites.filter(fav => fav.id !== animeId);
    await this.userRepo.save(user);

    return user.favorites;
  }

  async getUserRatings(userId: number) {
    const user = await this.userRepo.findOneBy({ id: userId });

    if (!user) {
      throw new Error('User not found');
    }

    // В реальной реализации нужно получить рейтинги из отдельной таблицы
    // Это упрощенная реализация
    return user.ratings || [];
  }

  async addRating(userId: number, animeId: number, score: number) {
    const user = await this.userRepo.findOneBy({ id: userId });

    if (!user) {
      throw new Error('User not found');
    }

    const anime = await this.animeRepo.findOneBy({ id: animeId });

    if (!anime) {
      throw new Error('Anime not found');
    }

    if (!user.ratings) {
      user.ratings = [];
    }

    // Обновляем рейтинг, если он уже существует
    const existingRatingIndex = user.ratings.findIndex(r => r.animeId === animeId);

    if (existingRatingIndex >= 0) {
      user.ratings[existingRatingIndex].score = score;
    } else {
      user.ratings.push({ animeId, score });
    }

    await this.userRepo.save(user);

    return user.ratings;
  }
}
