import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BooksEntity } from './entities/books.entity';
import { Between, In, Repository } from 'typeorm';
import getLogger from '../../common/logger';

const logger = getLogger('book-service')
@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(BooksEntity)
    private readonly bookRepository: Repository<BooksEntity>,
  ) {}

  public async findBook(bookId: number) {
    if (!bookId) {
      throw new BadRequestException('bookId값을 확인해 주세요.');
    }
    return this.bookRepository.findOne({ where: { id: bookId } });
  }

  public async findAllBooks() {
    return this.bookRepository.find();
  }

  public async findBooksByCategory({ category, skip, limit }): Promise<[BooksEntity[], number]> {
    if (!category) {
      throw new BadRequestException('category 값을 확인해 주세요.');
    }

    const [books, total] = await this.bookRepository
      .createQueryBuilder('book')
      .select([
        'book.id',
        'book.title',
        'book.cover',
        'book.author',
        'book.publisher',
        'book.description',
        'book.salePrice',
        'book.regularPrice',
      ])
      .where({ sourceType: category })
      .orderBy('RAND()')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

      return [books, total];
  }

  public async findRandomBooksByIds({ bookIds, skip, limit }): Promise<[BooksEntity[], number]> {
    const [books, total] = await this.bookRepository
      .createQueryBuilder('book')
      .select([
        'book.id',
        'book.title',
        'book.cover',
        'book.author',
        'book.publisher',
        'book.description',
        'book.salePrice',
        'book.regularPrice',
      ])
      .whereInIds(bookIds)
      .orderBy('RAND()')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

      return [books, total];
  }

  public async findRandomBooksBySourceAndDate(skip: number, limit: number) {
    const [books, total] = await this.bookRepository
      .createQueryBuilder('book')
      .select([
        'book.id',
        'book.title',
        'book.cover',
        'book.author',
        'book.publisher',
        'book.createdAt',
      ])
      .where({
        sourceType: 'ItemNewAll',
      })
      .orderBy('RAND()')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return { books, total };
  }

  public async bestsellingBooks() {
    return this.bookRepository.find({
      where: { sourceType: 'Bestseller' },
    });
  }

  public async findBooksIds(bookIds: number[]) {
    return this.bookRepository.find({
      where: { id: In(bookIds) },
    });
  }

  public async findItemNewSpecial(limit: number) {
    return this.bookRepository.find({
      select: ['id', 'cover'],
      where: { sourceType: 'ItemNewSpecial' },
      take: limit,
    });
  }

  public async findBooksByIds(uniqueBookIds: number[]) {
    return this.bookRepository.find({
      select: ['id', 'title', 'cover', 'author', 'publisher'],
      where: { id: In(uniqueBookIds) },
    });
  }
}
