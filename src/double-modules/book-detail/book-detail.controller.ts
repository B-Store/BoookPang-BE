import { Controller, Get, Param } from '@nestjs/common';
import { BookDetailService } from './book-detail.service';
import { ApiParam, ApiTags } from '@nestjs/swagger';

@ApiTags('도서')
@Controller('book-detail')
export class BookDetailController {
  constructor(private readonly bookDetailService: BookDetailService) {}

  /**
   * 책 상세조회
   * @param bookId
   * @returns
   */
  @Get(':bookId')
  @ApiParam({ name: 'bookId', required: true, description: '책 ID', example: 1 })
  async findBookDetall(@Param('bookId') bookId: number) {
    return this.bookDetailService.findBookDetall(bookId);
  }
}
