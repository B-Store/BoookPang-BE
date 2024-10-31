import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { BooksCategoryEntity } from '../books-category/entities/books-category.entity';
import { BooksEntity } from '../books/entities/books.entity';
import { Between, In, Repository } from 'typeorm';
import { Cache } from 'cache-manager';
import { OrderService } from '../order/order.service';
import { CategoryService } from '../category/category.service';

@Injectable()
export class BooksMainService {
  constructor(
    @InjectRepository(BooksEntity)
    private readonly bookRepository: Repository<BooksEntity>,
    @InjectRepository(BooksCategoryEntity)
    private readonly bookCategoryRepository: Repository<BooksCategoryEntity>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    private categoryService: CategoryService,
    private orderService: OrderService,
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
      const categoryEntity = await this.categoryService.findCategoryID(category)

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
    const cacheKey = `bestsellers:${page}:${limit}`;

    const cachedData = await this.cacheManager.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const bestsellingBooks = await this.bookRepository.find({
      where: { sourceType: 'Bestseller' },
    });

    const aggregatedData = await this.orderService.getTotalSalesForBooks(
      bestsellingBooks.map((book) => book.id),
    );

    const bookIds = aggregatedData.map((data) => data.bookId);
    const booksData = await this.bookRepository.find({
      where: { id: In(bookIds) },
    });

    const resultData = aggregatedData.map((aggData) => {
      const book = booksData.find((b) => b.id === aggData.bookId);
      return {
        ...book,
        totalQuantity: aggData.totalQuantity,
      };
    });

    const total = resultData.length;
    const paginatedData = resultData.slice((page - 1) * limit, page * limit);

    const result = {
      total,
      page,
      limit,
      data: paginatedData,
    };

    await this.cacheManager.set(cacheKey, result, 300000);

    return result;
  }

  public async findCategories(category: string) {
    const data = await this.categoryService.findCategoryDepth1(category)

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
      take: limit,
    });
  }
}
