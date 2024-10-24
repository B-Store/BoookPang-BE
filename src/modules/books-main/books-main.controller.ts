import { Controller, Get, Query } from '@nestjs/common';
import { BooksMainService } from './books-main.service';
import { ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('도서 메인페이지')
@Controller('books-main')
export class BooksMainController {
  constructor(private readonly booksMainService: BooksMainService) {}

    /**
   * 북팡에서 꾸준히 사랑받는 리스트
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
      description: '카테고리: 추천(ItemEditorChoice), 국내도서(book), 외국도서(Foreign), 전자책(eBook)',
      example: 'ItemEditorChoice',
    })
    findRecommendedBooks(
      @Query('page') page: number = 1,
      @Query('limit') limit: number = 5,
      @Query('category') category: string = 'ItemEditorChoice',
    ) {
      return this.booksMainService.findRecommendedBooks(page, limit, category);
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
      return this.booksMainService.findNewBooks(page, limit);
    }
  
    /**
     * 베스트셀러 리스트
     * @param page
     * @param limit
     * @returns
     */
    @Get('bestsellers')
    @ApiQuery({ name: 'page', required: true, description: '페이지 번호', example: 1 })
    @ApiQuery({ name: 'limit', required: true, description: '페이지당 항목 수', example: 15 })
    findBestsellers(@Query('page') page: number = 1, @Query('limit') limit: number = 15) {
      return this.booksMainService.findBestsellers(page, limit);
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
      return this.booksMainService.findCategories(category);
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
      example: 3
    })
    findItemNewSpecial(@Query('limit') limit: number = 3){
      return this.booksMainService.findItemNewSpecial(limit)
    }
}

