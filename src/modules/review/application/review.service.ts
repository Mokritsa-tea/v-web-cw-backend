import { AppDataSource } from '../../../shared/database/data-source';
import { Review } from '../domain/review.entity';
import { Anime } from '../../anime/domain/anime.entity';
import { User } from '../../user/domain/user.entity';

export class ReviewService {
  private reviewRepo = AppDataSource.getRepository(Review);
  private animeRepo = AppDataSource.getRepository(Anime);
  private userRepo = AppDataSource.getRepository(User);

  async createReview(
    userId: number,
    animeId: number,
    rating: number,
    text?: string,
  ) {
    const user = await this.userRepo.findOneByOrFail({ id: userId });
    const anime = await this.animeRepo.findOneByOrFail({ id: animeId });

    // 1️⃣ сохраняем отзыв
    const review = this.reviewRepo.create({
      user,
      anime,
      rating,
      text,
    });

    await this.reviewRepo.save(review);

    // 2️⃣ пересчитываем рейтинг
    await this.recalculateAnimeRating(animeId);

    return review;
  }

  async getReviewsByAnime(animeId: number) {
    return this.reviewRepo.find({
      where: { anime: { id: animeId } },
      relations: ['user'],
    });
  }

  private async recalculateAnimeRating(animeId: number) {
    const reviews = await this.reviewRepo.find({
      where: { anime: { id: animeId } },
    });

    if (reviews.length === 0) return;

    const avg =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await this.animeRepo.update(animeId, {
      ratingAvg: Number(avg.toFixed(2)),
    });
  }
}
