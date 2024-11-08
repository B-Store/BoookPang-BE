import { RevirewCreateDto } from '../../modules/review/dto/create.review.dto';
import { BooksService } from './../../modules/books/books.service';
import { ReviewService } from './../../modules/review/review.service';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class BookReviewModuleService {
  constructor(
    private readonly reviewService: ReviewService,
    private readonly booksService: BooksService,
  ) {}
  async createReview(userId: number, reviewCreateDto: RevirewCreateDto) {
    const { title, bookId, comment, stars } = reviewCreateDto;
    if (!bookId || !title || !comment) {
      throw new BadRequestException('bookId, title, comment 값을 확인해 주세요.');
    }

    if (stars < 1 || stars > 5) {
      throw new BadRequestException('stars 값은 1에서 5 사이여야 합니다.');
    }

    const review = this.reviewService.createReview({
      userId,
      bookId,
      title,
      comment,
      stars,
    });
    // 책의 평균 별점 계산 및 업데이트
    await this.updateBookAverageRating(bookId);

    return review;
  }

  private async updateBookAverageRating(bookId: number) {
    const reviews = await this.reviewService.findBookReview(bookId);
    const totalStars = reviews.reduce((sum, review) => sum + review.stars, 0);
    const averageRating = reviews.length > 0 ? totalStars / reviews.length : null;

    return this.booksService.updateBooksReview(bookId, averageRating);
  }
}
