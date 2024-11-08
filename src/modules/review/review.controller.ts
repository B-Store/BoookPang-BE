import { Controller, Get, Param } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ApiTags } from '@nestjs/swagger';
@ApiTags('리뷰')
@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}
  /**
   * 리뷰 ALL 조회
   * @param bookId
   * @returns
   */
  @Get('/:bookId')
  findReview(@Param('bookId') bookId: number) {
    return this.reviewService.findBookReview(bookId);
  }
}
