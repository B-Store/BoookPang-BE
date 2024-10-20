import { Controller, Get, Param, Query } from '@nestjs/common';
import { BooksService } from './books.service';
import { ApiTags, ApiQuery, ApiParam } from '@nestjs/swagger';

@ApiTags('도서')
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  /**
   * 책 상세조회
   * @param bookId
   * @returns
   */
  @Get('book-Detall/:bookId')
  @ApiParam({ name: 'bookId', required: true, description: '책 ID', example: 1 })
  findBookDetall(@Param('bookId') bookId: number) {
    return this.booksService.findBookDetall(bookId);
  }
}
