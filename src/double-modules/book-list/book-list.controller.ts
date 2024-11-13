import { Controller, Get, Param, Query } from '@nestjs/common';
import { BookListService } from './book-list.service';
import { ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('도서 리스트')
@Controller('book-list')
export class BookListController {
  constructor(private readonly bookListService: BookListService) {}

  /**
   * 편집장 Pick
   * @param page
   * @param limit
   * @param category
   * @returns
   */
  @Get('recommended-books')
  @ApiQuery({ name: 'page', required: true, description: '페이지 번호', example: 1 })
  @ApiQuery({ name: 'limit', required: true, description: '페이지당 항목 수', example: 5 })
  @ApiQuery({
    name: 'category',
    required: true,
    description: '카테고리: 편집장 추천(ItemEditorChoice)',
    example: 'ItemEditorChoice',
  })
  findRecommendedBooks(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 5,
    @Query('category') category: string = 'ItemEditorChoice',
  ) {
    return this.bookListService.findRecommendedBooks(page, limit, category);
  }

  /**
   * 신간 리스트
   * @param page
   * @param limit
   * @returns
   */
  @Get('new-books')
  @ApiQuery({ name: 'page', required: true, description: '페이지 번호', example: 1 })
  @ApiQuery({ name: 'limit', required: true, description: '페이지당 항목 수', example: 15 })
  @ApiQuery({
    name: 'category',
    required: true,
    description: '카테고리: 신간 리스트(ItemNewAll)',
    example: 'ItemNewAll',
  })
  findNewBooks(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 15,
    @Query('category') category: string = 'ItemNewAll',
  ) {
    return this.bookListService.findNewBooks({ page, limit, category });
  }

  /**
   * 베스트셀러 리스트
   * @param page
   * @param limit
   * @returns
   */
  @Get('bestsellers')
  @ApiQuery({ name: 'page', required: true, description: '페이지 번호', example: 1 })
  @ApiQuery({ name: 'limit', required: true, description: '페이지당 항목 수', example: 24 })
  @ApiQuery({
    name: 'category',
    required: true,
    description: '카테고리: 베스트셀러(Bestseller)',
    example: 'Bestseller',
  })
  findBestsellers(@Query('page') page: number = 1, @Query('limit') limit: number = 24,
  @Query('category') category: string = 'Bestseller',
) {
    return this.bookListService.findBestsellers({page, limit, category});
  }

  /**
   * 주목할 만한 리스트
   * @param limit
   * @returns
   */
  @Get('new-special-items')
  @ApiQuery({
    name: 'limit',
    required: true,
    description: '항목 수',
    example: 3,
  })
  findItemNewSpecial(@Query('limit') limit: number = 3) {
    return this.bookListService.findItemNewSpecial(limit);
  }

  // 추후에 수정
  /**
   *
   * 책 카테고리 전체 리스트 (국내도서 등)
   * @param category
   * @returns
   */
  @Get('category-books-list')
  @ApiQuery({ name: 'category', required: true, description: '카테고리', example: '국내도서' })
  findBookDetail(@Query('category') category: string) {
    return this.bookListService.findBookCategoryList(category);
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
    return this.bookListService.findBooksCategoryId({ categoryId, page, limit });
  }
}
