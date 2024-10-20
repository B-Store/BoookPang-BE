import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { BooksCategoryEntity } from '../../entities/books-category.entity';
import { BooksEntity } from '../../entities/books.entity';
import { CategoryEntity } from '../../entities/category.entity';
import { Between, In, Repository } from 'typeorm';
import { Cache } from 'cache-manager';

@Injectable()
export class BooksMainService {
  constructor(
    @InjectRepository(BooksEntity)
    private readonly bookRepository: Repository<BooksEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
    @InjectRepository(BooksCategoryEntity)
    private readonly bookCategoryRepository: Repository<BooksCategoryEntity>,
    @Inject(CACHE_MANAGER) 
    private cacheManager: Cache,
  ) {}
  
  public async findRecommendedBooks(page: number, limit: number, category: string) {
    const skip = (page - 1) * limit;
    const cacheKey = `recommendedBooks:${page}:${limit}:${category}`;

    const cachedData = await this.cacheManager.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    let books: any[], total: any;

    if (category === 'ItemEditorChoice') {
      [books, total] = await this.bookRepository
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
        .orderBy('RAND()')
        .where({ sourceType: category })
        .skip(skip)
        .take(limit)
        .getManyAndCount();
    } else {
      const categoryEntity = await this.categoryRepository.find({
        select: ['id'],
        where: { mall: category },
      });

      if (!categoryEntity) {
        throw new BadRequestException('category 값을 확인해 주세요.');
      }
      const categoryIds = categoryEntity.map((entity) => entity.id);

      const booksCategoryData = await this.bookCategoryRepository.find({
        select: ['bookId'],
        where: { categoryId: In(categoryIds) },
      });

      const bookIds = booksCategoryData.map((data) => data.bookId);

      if (bookIds.length === 0) {
        throw new NotFoundException('해당 카테고리에 속하는 책이 없습니다.');
      }

      // bookIds 배열로 book 테이블 조회
      [books, total] = await this.bookRepository
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
    }

    const processedBooks = books.map((book) => {
      const discountRate = book.regularPrice
        ? Math.round(((book.regularPrice - book.salePrice) / book.regularPrice) * 100)
        : 0;

      return {
        ...book,
        discountRate: discountRate,
      };
    });

    const result = {
      data: processedBooks,
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

    const startOfMonth = new Date();
    startOfMonth.setDate(1);

    const now = new Date();

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
        createdAt: Between(startOfMonth, now),
      })
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

  public async findBestsellers(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const cacheKey = `bestsellers:${page}:${limit}`;

    const cachedData = await this.cacheManager.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const startOfMonth = new Date();
    startOfMonth.setDate(1);

    const now = new Date();

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
        sourceType: 'Bestseller',
        createdAt: Between(startOfMonth, now),
      })
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

  public async findCategories(category: string) {
    const data = await this.categoryRepository.find({
      select: ['id', 'depth1'],
      where: { mall: category },
    });

    // id와 depth1을 기준으로 고유한 카테고리 목록 생성
    const uniqueCategories = data.reduce((acc, item) => {
      const exists = acc.find((cat) => cat.depth1 === item.depth1);
      if (item.depth1 && item.depth1.trim() !== '' && !exists) {
        acc.push({ id: item.id, depth1: item.depth1 });
      }
      return acc;
    }, []);

    return uniqueCategories;
  }

  public async findItemNewSpecial(limit: number) {
    return this.bookRepository.find({
      select: ['id', 'cover'],
      where: { sourceType: 'ItemNewSpecial' },
      take: limit
    });
  }
}
