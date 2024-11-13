import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BooksEntity } from './entities/books.entity';
import { In, Repository } from 'typeorm';
import getLogger from '../../common/logger';

const logger = getLogger('book-service');
@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(BooksEntity)
    private readonly bookRepository: Repository<BooksEntity>,
  ) {}

  public async findAllBooks() {
    return this.bookRepository.find();
  }

  public async findBooksByCategory({ category, skip, limit }): Promise<[BooksEntity[], number]> {
    if (!category) {
      throw new BadRequestException('category 값을 확인해 주세요.');
    }

    const [books, total] = await this.bookRepository
      .createQueryBuilder('book')
      .where({ sourceType: category })
      .orderBy('RAND()')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return [books, total];
  }

  public async findOneBookId(bookId: number) {
    if (!bookId) {
      throw new BadRequestException('bookId값을 확인해 주세요.');
    }
    return this.bookRepository.findOne({ where: { id: bookId } });
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

  public async updateBooksReview(bookId: number, averageRating: number) {
    return this.bookRepository.update({ id: bookId }, { averageRating });
  }

  public async findBooksIdSearch(books: BooksEntity[]) {
    const bookIds = books.map((book) => book.id);
  
    const results = await this.bookRepository.find({
      where: { id: In(bookIds) },
    });
  
    const sortedResults = bookIds.map(id => results.find(book => book.id === id));
  
    return sortedResults;
  }
}
