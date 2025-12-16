import { AppDataSource } from '../../../shared/database/data-source';
import { Review } from '../domain/review.entity';
import { User } from '../../user/domain/user.entity';

export class ReviewService {
  private reviewRepo = AppDataSource.getRepository(Review);
  private userRepo = AppDataSource.getRepository(User);

  async createReview(userId: number, animeId: number, rating: number, text: string) {
    const review = this.reviewRepo.create({
      userId,
      animeId,
      rating,
      text,
    });

    const savedReview = await this.reviewRepo.save(review);

    const userData = await this.userRepo.findOne({
      where: { id: userId },
      select: ['id', 'email', 'name']
    });

    return {
      id: savedReview.id,
      animeId: savedReview.animeId,
      userId: savedReview.userId,
      rating: savedReview.rating,
      text: savedReview.text,
      user: userData
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
