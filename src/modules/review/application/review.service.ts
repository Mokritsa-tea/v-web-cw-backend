import { AppDataSource } from '../../../shared/database/data-source';
import { Review } from '../domain/review.entity';
import { User } from '../../user/domain/user.entity';
import { Anime } from '../../anime/domain/anime.entity';

export class ReviewService {
  private reviewRepo = AppDataSource.getRepository(Review);
  private userRepo = AppDataSource.getRepository(User);
  private animeRepo = AppDataSource.getRepository(Anime);

  async createReview(userId: number, animeId: number, rating: number, text?: string) {
    const user = await this.userRepo.findOneBy({ id: userId });
    const anime = await this.animeRepo.findOneBy({ id: animeId });
    if (!user || !anime) throw new Error('User or Anime not found');

    const review = this.reviewRepo.create({ user, anime, rating, text });
    return this.reviewRepo.save(review);
  }

  async getReviewsByAnime(animeId: number) {
    return this.reviewRepo.find({
      where: { anime: { id: animeId } },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }
}
