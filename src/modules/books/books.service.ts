import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BooksEntity } from '../../entities/books.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(BooksEntity)
    private readonly bookRepository: Repository<BooksEntity>,
  ) {}

  public async findBookDetall(bookId: number) {
    return this.bookRepository.findOne({
      where: { id: bookId },
    });
  }
}
