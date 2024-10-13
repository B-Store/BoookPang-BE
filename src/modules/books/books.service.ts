import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BooksEntity } from '../../entities/books.entity';
import { In, Repository } from 'typeorm';
import { CategoryEntity } from '../../entities/category.entity';
import { BooksCategoryEntity } from '../../entities/books-category.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(BooksEntity)
    private readonly bookRepository: Repository<BooksEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
    @InjectRepository(BooksCategoryEntity)
    private readonly bookCategoryRepository: Repository<BooksCategoryEntity>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  public async findRecommendedBooks(page: number, limit: number, category: string) {
    const skip = (page - 1) * limit;
    const cacheKey = `recommendedBooks:${page}:${limit}:${category}`;

    const cachedData = await this.cacheManager.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const queryBuilder = this.bookRepository.createQueryBuilder('book');

    if (category !== 'all') {
      queryBuilder.where('book.searchTarget = :category', { category });
    }

    const [books, total] = await queryBuilder
      .select([
        'book.id',
        'book.title',
        'book.cover',
        'book.author',
        'book.publisher',
        'book.description',
        'book.salePrice',
      ])
      .orderBy('RAND()')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const result = {
      data: books,
      total,
      page,
      limit,
    };

    await this.cacheManager.set(cacheKey, result, 300000);
    return result;
  }

  public async findNewBooks(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const cacheKey = `new-books:${page}:${limit}`;

    const cachedData = await this.cacheManager.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    // 데이터베이스에서 랜덤으로 데이터 조회
    const [books, total] = await this.bookRepository
      .createQueryBuilder('book')
      .select(['book.id', 'book.title', 'book.cover', 'book.author', 'book.publisher'])
      .where({ sourceType: 'ItemNewAll' })
      .orderBy('RAND()') // 랜덤 정렬 추가
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const result = {
      data: books,
      total,
      page,
      limit,
    };

    await this.cacheManager.set(cacheKey, result, 300000);

    return result;
  }

  public async findBestsellers(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const cacheKey = `bestsellers:${page}:${limit}`;

    const cachedData = await this.cacheManager.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    const queryBuilder = this.bookRepository.createQueryBuilder('book');

    const [books, total] = await queryBuilder
      .select(['id', 'title', 'cover', 'author', 'publisher'])
      .where({ sourceType: 'Bestseller' })
      .orderBy('RAND()')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const result = {
      data: books,
      total,
      page,
      limit,
    };

    await this.cacheManager.set(cacheKey, result, 300000);

    return result;
  }

  public async categories(category: string) {
    const data = await this.categoryRepository.find({
      select: ['id', 'depth1'],
      where: { mall: category },
    });
    const uniqueCategories = Array.from(
      new Set(data.map((item) => item.depth1).filter((depth1) => depth1 && depth1.trim() !== '')),
    );
    return uniqueCategories;
  }

  public async findBookCategoryList(category: string) {
    const data = await this.categoryRepository.find({
      select: ['id'],
      where: { mall: category },
    });
    const categoryIds = data.map((cat) => cat.id);

    const bookCategories = await this.bookCategoryRepository.find({
      select: ['bookId'],
      where: { categoryId: In(categoryIds) },
    });

    const uniqueBookIds = [...new Set(bookCategories.map((item) => item.bookId))];
    return this.bookRepository.find({
      select: ['id', 'title', 'cover', 'author', 'publisher'],
      where: { id: In(uniqueBookIds) },
    });
  }

  public async findBookDetall(bookId: number) {
    return this.bookRepository.findOne({
      where: { id: bookId },
    });
  }
}
