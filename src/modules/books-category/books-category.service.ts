import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BooksCategoryEntity } from './entities/books-category.entity';

@Injectable()
export class BooksCategoryService {
  constructor(
    @InjectRepository(BooksCategoryEntity)
    private readonly booksCategoryRepository: Repository<BooksCategoryEntity>,
  ) {}

  public async findBooksCategory(bookId: number) {
    return this.booksCategoryRepository.find({ where: { bookId: bookId } });
  }
}
