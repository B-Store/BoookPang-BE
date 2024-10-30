import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CategoryEntity } from '../../entities/category.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) {}

  public async findCategorys(categoryIds: number[]) {
    return this.categoryRepository.find({
      where: { id: In(categoryIds) },
    });
  }

  public async findCategoryID(category: string) {
    const categoryMap: { [key: string]: string } = {
      book: '국내도서',
      eBook: '전자책',
      Foreign: '외국도서',
    };

    const koreanCategory = categoryMap[category];
    if (!koreanCategory) {
      throw new BadRequestException('유효하지 않은 카테고리입니다.');
    }

    return this.categoryRepository.find({ where: { mall: koreanCategory } });
  }
}
