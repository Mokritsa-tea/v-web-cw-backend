import { AppDataSource } from '../../../shared/database/data-source';
import { User } from '../domain/user.entity';
import { Anime } from '../../anime/domain/anime.entity';
import { Favorite } from '../domain/favorite.entity';
import { Rating } from '../domain/rating.entity';
import bcrypt from 'bcrypt';

export class UserService {
  private userRepo = AppDataSource.getRepository(User);
  private animeRepo = AppDataSource.getRepository(Anime);
  private favoriteRepo = AppDataSource.getRepository(Favorite);
  private ratingRepo = AppDataSource.getRepository(Rating);

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

  async updateUser(id: number, data: { name?: string }) {
    const user = await this.userRepo.findOneBy({ id });
    if (!user) {
      throw new Error('User not found');
    }

    if (data.name !== undefined) {
      user.name = data.name;
    }

    return this.userRepo.save(user);
  }

  async getUserFavorites(userId: number) {
    return this.favoriteRepo.find({
      where: { userId },
      relations: ['anime']
    });
  }

  async addToFavorites(userId: number, animeId: number) {
    const existingFavorite = await this.favoriteRepo.findOne({
      where: { userId, animeId }
    });

    if (existingFavorite) {
      return this.getUserFavorites(userId);
    }

    const anime = await this.animeRepo.findOneBy({ id: animeId });
    if (!anime) {
      throw new Error('Anime not found');
    }

    const favorite = this.favoriteRepo.create({ userId, animeId });
    await this.favoriteRepo.save(favorite);

    return this.getUserFavorites(userId);
  }

  async removeFromFavorites(userId: number, animeId: number) {
    const result = await this.favoriteRepo.delete({ userId, animeId });
    if (result.affected === 0) {
      throw new Error('Favorite not found');
    }
    return this.getUserFavorites(userId);
  }

  async getUserRatings(userId: number) {
    return this.ratingRepo.find({
      where: { userId },
      relations: ['anime']
    });
  }

  async addRating(userId: number, animeId: number, score: number) {
    const existingRating = await this.ratingRepo.findOne({ where: { userId, animeId } });

    if (existingRating) {
      existingRating.score = score;
      await this.ratingRepo.save(existingRating);
    } else {
      const rating = this.ratingRepo.create({ userId, animeId, score });
      await this.ratingRepo.save(rating);
    }

    return this.getUserRatings(userId);
  }
}
