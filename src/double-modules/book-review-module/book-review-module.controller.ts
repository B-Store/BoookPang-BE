import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { BookReviewModuleService } from './book-review-module.service';
import { ApiTags } from '@nestjs/swagger';
import { JwtAccessGuards } from 'src/modules/auth/providers/jwt-strategy';
import { RequestTokensByHttp } from 'src/decorator/jwt-http-request';
import { RevirewCreateDto } from 'src/modules/review/dto/create.review.dto';
import { UsersEntity } from '../../modules/auth/entities/users.entity';

@ApiTags('리뷰')
@Controller('book-review-module')
export class BookReviewModuleController {
  constructor(private readonly bookReviewModuleService: BookReviewModuleService) {}

  /**
   * 리뷰 생성
   * @param reviewCreateDto
   * @returns
   */
  @Post()
  @UseGuards(JwtAccessGuards)
  createReview(
    @RequestTokensByHttp() { user: { id: userId } }: { user: Pick<UsersEntity, 'id'> },
    @Body() reviewCreateDto: RevirewCreateDto,
  ) {
    console.log(userId)
    return this.bookReviewModuleService.createReview(userId, reviewCreateDto);
  }
}
