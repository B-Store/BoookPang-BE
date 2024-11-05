import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { BooksCategoryEntity } from './entities/books-category.entity';

@Injectable()
export class BooksCategoryService {
  constructor(
    @InjectRepository(BooksCategoryEntity)
    private readonly booksCategoryRepository: Repository<BooksCategoryEntity>,
  ) {}

  public async findBooksByCategoryIds(categoryIds: number[]) {
    return this.booksCategoryRepository.find({
      select: ['bookId'],
      where: { categoryId: In(categoryIds) },
    });
  }
  
  public async findBooksByCategoryId(bookId: number) {
    return this.booksCategoryRepository.find({ where: { bookId: bookId } });
  }

  public async findCategoryId(categoryId: number){
    return this.booksCategoryRepository.find({where: {categoryId}})
  }
}
