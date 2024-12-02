import { Controller, Get, Query } from '@nestjs/common';
import { CategoryService } from './category.service';
import { ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('카테고리')
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  /**
   * 카테고리 리스트
   * @param category
   * @returns
   */
  @Get()
  @ApiQuery({
    name: 'category',
    required: true,
    description: '카테고리(국내도서, 외국도서, 전자책',
    example: '국내도서',
  })
  findCategories(@Query('category') category: string) {
    return this.categoryService.findCategories(category);
  }
}
