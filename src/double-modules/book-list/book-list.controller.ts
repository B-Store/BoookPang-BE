import { Controller, Get, Query } from '@nestjs/common';
import { BookListService } from './book-list.service';
import { ApiQuery, ApiTags } from '@nestjs/swagger';

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
    description:
      '카테고리: 편집장 추천(ItemEditorChoice), 국내도서(book), 외국도서(Foreign), 전자책(eBook)',
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
  findNewBooks(@Query('page') page: number = 1, @Query('limit') limit: number = 15) {
    return this.bookListService.findNewBooks(page, limit);
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
  findBestsellers(@Query('page') page: number = 1, @Query('limit') limit: number = 24) {
    return this.bookListService.findBestsellers(page, limit);
  }

  /**
   * 카테고리 리스트
   * @param category
   * @returns
   */
  @Get('categories')
  @ApiQuery({
    name: 'category',
    required: true,
    description: '카테고리(국내도서, 외국도서, 전자책',
    example: '국내도서',
  })
  findCategories(@Query('category') category: string) {
    return this.bookListService.findCategories(category);
  }

  /**
   * 주목할 만한 리스트
   * @param limit
   * @returns
   */
  @Get('ItemNewSpecial')
  @ApiQuery({
    name: 'limit',
    required: true,
    description: '항목 수',
    example: 3,
  })
  findItemNewSpecial(@Query('limit') limit: number = 3) {
    return this.bookListService.findItemNewSpecial(limit);
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
    return this.bookListService.findBookCategoryList(category);
  }
}
