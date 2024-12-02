import { Controller, Get, Param, Query } from '@nestjs/common';
import { BookCategoryListService } from './book-category-list.service';
import { ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('카테고리 리스트')
@Controller('book-category-list')
export class BookCategoryListController {
  constructor(private readonly bookCategoryListService: BookCategoryListService) {}

  /**
   *
   * 책 카테고리 전체 리스트 (국내도서 등)
   * @param category
   * @returns
   */
  @Get('category-books-list')
  @ApiQuery({ name: 'category', required: true, description: '카테고리', example: '국내도서' })
  findBookDetail(@Query('category') category: string) {
    return this.bookCategoryListService.findBookCategoryList(category);
  }

  /**
   * 카테고리 ID에 따른 도서 리스트 조회
   * @param categoryId
   * @returns
   */
  @Get('category-books-list/:categoryId')
  @ApiQuery({ name: 'page', required: true, description: '페이지 번호', example: 1 })
  @ApiQuery({ name: 'limit', required: true, description: '페이지당 항목 수', example: 15 })
  @ApiParam({ name: 'categoryId', required: true, description: '카테고리 고유키', example: 1 })
  async findBooksByCategoryId(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 15,
    @Param('categoryId') categoryId: number,
  ) {
    return this.bookCategoryListService.findBooksCategoryId({ categoryId, page, limit });
  }
}
