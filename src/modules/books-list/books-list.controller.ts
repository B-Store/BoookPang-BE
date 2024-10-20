import { Controller, Get, Query } from '@nestjs/common';
import { BooksListService } from './books-list.service';
import { ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('도서 리스트관련')
@Controller('books-list')
export class BooksListController {
  constructor(private readonly booksListService: BooksListService) {}

  /**
   * 검색 리스트
   * @param title
   * @param page
   * @param limit
   * @returns
   */
  @Get('search-books-list')
  @ApiQuery({ name: 'title', required: true, description: '검색 내용', example: '책' })
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: '페이지당 문서 수', example: 20 })
  findBookSearchList(
    @Query('title') title: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    const from = (page - 1) * limit;
    const query = {
      query: {
        match: {
          title: {
            query: title,
            fuzziness: 1,
          },
        },
      },
      from,
      size: limit,
    };
    return this.booksListService.findBookSearchList(query, page, limit);
  }

  /**
   *
   * 책 카테고리 전체 리스트 (국내도서 등)
   * @param category
   * @returns
   */
  @Get('category-books-list')
  @ApiQuery({ name: 'category', required: true, description: '카테고리', example: '국내도서' })
  findBookDetail(@Query('category') category: string) {
    return this.booksListService.findBookCategoryList(category);
  }
}
