import { Controller, Get, Query } from '@nestjs/common';
import { MainPageService } from './main-page.service';
import { ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('메인페이지')
@Controller('main-page')
export class MainPageController {
  constructor(private readonly mainPageService: MainPageService) {}

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
    return this.mainPageService.findRecommendedBooks(page, limit, category);
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
    return this.mainPageService.findNewBooks({ page, limit, category });
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
  findBestsellers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 24,
    @Query('category') category: string = 'Bestseller',
  ) {
    return this.mainPageService.findBestsellers({ page, limit, category });
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
    return this.mainPageService.findItemNewSpecial(limit);
  }
}
