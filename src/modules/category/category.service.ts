import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CategoryEntity } from './entities/category.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) {}

  public async findCategories(category: string) {
    const data = await this.categoryRepository.find({where: {mall: category}})
    const seenDepth1 = new Set();
    const uniqueCategories = data.filter(item => {
      if (item.depth1 && item.depth1.trim() !== '' && !seenDepth1.has(item.depth1)) {
        seenDepth1.add(item.depth1);
        return true;
      }
      return false;
    }).map(item => ({ id: item.id, depth1: item.depth1 }));

    return uniqueCategories;
  }

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

  // TODO 추후에 제거 예정
  // public async findCategoryDepth1(category:string){
  //   return this.categoryRepository.find({where: {mall: category}})
  // }
  
  public async findCategoryIdsByMall(category: string){
    return this.categoryRepository.find({
      select: ['id'],
      where: { mall: category },
    });
  }
}
