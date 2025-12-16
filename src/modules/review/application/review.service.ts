import { AppDataSource } from '../../../shared/database/data-source';
import { Review } from '../domain/review.entity';
import { User } from '../../user/domain/user.entity';

export class ReviewService {
  private reviewRepo = AppDataSource.getRepository(Review);
  private userRepo = AppDataSource.getRepository(User);

  async createReview(userId: number, animeId: number, rating: number, text: string, userName?: string) {
    const review = this.reviewRepo.create({
      userId,
      animeId,
      rating,
      text,
    });

    const savedReview = await this.reviewRepo.save(review);

    const userData = await this.userRepo.findOneBy({ id: userId });

    return {
      id: savedReview.id,
      animeId: savedReview.animeId,
      userId: savedReview.userId,
      rating: savedReview.rating,
      text: savedReview.text,
      user: {
        id: userId,
        email: userData?.email || '',
        name: userName || userData?.name
      }
    };
  }

  async getReviewsByAnime(animeId: number) {
    const reviews = await this.reviewRepo.find({
      where: { animeId },
      relations: ['user'],
      order: { createdAt: 'DESC' }
    });

    return reviews.map(review => ({
      id: review.id,
      animeId: review.animeId,
      userId: review.userId,
      rating: review.rating,
      text: review.text,
      user: {
        id: review.user.id,
        email: review.user.email,
        name: review.user.name
      }
    }));
  }
}
