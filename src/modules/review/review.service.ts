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

  async createReview(userId: number, reviewCreateDto: RevirewCreateDto) {
    const { title, bookId, comment, stars } = reviewCreateDto;
    if (!bookId || !title || !comment) {
      throw new BadRequestException('bookId, title, comment 값을 확인해 주세요.');
    }

    if (stars < 1 || stars > 5) {
      throw new BadRequestException('stars 값은 1에서 5 사이여야 합니다.');
    }

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

  public async findBooksreiew(bookId: number) {
    return this.reviewRepository.find({ where: { bookId } });
  }
}
