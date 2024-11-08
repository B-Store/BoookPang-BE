import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ReviewEntity } from './entities/reviews.entity';
import { Repository } from 'typeorm';
import { RevirewCreateDto } from './dto/create.review.dto';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(ReviewEntity)
    private reviewRepository: Repository<ReviewEntity>,
  ) {}

  async createReview({ userId, bookId, title, comment, stars }) {
    const review = this.reviewRepository.create({
      userId,
      bookId,
      title,
      comment,
      stars,
    });
    return this.reviewRepository.save(review);
  }

  async findBookReview(bookId: number) {
    return this.reviewRepository.find({ where: { bookId } });
  }

  public async findReviewCount(bookId: number) {
    return this.reviewRepository.count({ where: { bookId } });
  }

  public async getReviewsAndCount(bookId: number) {
    const [reviews, reviewCount] = await Promise.all([
      this.reviewRepository.find({
        where: { bookId },
        order: { createdAt: 'DESC', stars: 'DESC' },
        take: 1,
      }),
      this.reviewRepository.count({ where: { bookId } }),
    ]);

    return { reviews, reviewCount };
  }

  public async findBooksreiew(bookId: number) {
    return this.reviewRepository.find({ where: { bookId } });
  }
}
