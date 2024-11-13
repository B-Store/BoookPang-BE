import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ReviewEntity } from './entities/reviews.entity';
import { Repository } from 'typeorm';

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

  public async findBookIdReiew(bookId: number) {
    return this.reviewRepository.find({ where: { bookId } });
  }

  // TODO 추후에 제거 예정
  // public async getReviewsAndCount(bookId: number) {
  //   const [reviews, reviewCount] = await Promise.all([
  //     this.reviewRepository.find({
  //       where: { bookId },
  //       order: { createdAt: 'DESC', stars: 'DESC' },
  //       take: 1,
  //     }),
  //     this.reviewRepository.count({ where: { bookId } }),
  //   ]);

  //   return { reviews, reviewCount };
  // }
}
