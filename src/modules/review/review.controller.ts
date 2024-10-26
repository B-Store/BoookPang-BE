import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ApiTags } from '@nestjs/swagger';
import { RevirewCreateDto } from './dto/create.review.dto';
import { RequestTokensByHttp } from '../../decorator/jwt-http-request';
import { JwtAccessGuards } from '../jwt/jwt-strategy';
import { UsersEntity } from '../../entities/users.entity';

@ApiTags('리뷰')
@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  /**
   * 리뷰 생성
   * @param reviewCreateDto
   * @returns
   */
  @Post()
  @UseGuards(JwtAccessGuards)
  createReview(
    @RequestTokensByHttp() { user: { id: userId } }: { user: Pick<UsersEntity, "id"> },
    @Body() reviewCreateDto: RevirewCreateDto,
  ) {
    return this.reviewService.createReview(userId, reviewCreateDto);
  }

  /**
   * 리뷰 ALL 조회
   * @param bookId 
   * @returns 
   */
  @Get('/:bookId')
  findReview(@Param('bookId') bookId: number) {
    return this.reviewService.findReview(bookId);
  }
}
