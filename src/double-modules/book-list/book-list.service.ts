import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { BooksCategoryService } from '../../modules/books-category/books-category.service';
import { BooksService } from '../../modules/books/books.service';
import { CategoryService } from '../../modules/category/category.service';
import { OrderService } from '../../modules/order/order.service';

@Injectable()
export class BookListService {
  constructor(
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    private booksService: BooksService,
    private categoryService: CategoryService,
    private bookCategoryService: BooksCategoryService,
    private orderService: OrderService,
  ) {}

  public async findRecommendedBooks(page: number, limit: number, category: string) {
    const skip = (page - 1) * limit;
    const cacheKey = `recommendedBooks:${page}:${limit}:${category}`;

    const cachedData = await this.cacheManager.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const [books, total] = await this.booksService.findBooksByCategory({ category, skip, limit });

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

    const { books, total } = await this.booksService.findRandomBooksBySourceAndDate(skip, limit);

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

    const bestsellingBooks = await this.booksService.bestsellingBooks();

    const aggregatedData = await this.orderService.getTotalSalesForBooks(
      bestsellingBooks.map((book) => book.id),
    );

    const bookIds = aggregatedData.map((data) => data.bookId);
    const booksData = await this.booksService.findBooksIds(bookIds);

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
    const data = await this.categoryService.findCategoryDepth1(category);

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
    const items = await this.booksService.findItemNewSpecial(limit);
    const uniqueItems = Array.from(new Set(items.map(item => item.id)))
      .map(id => items.find(item => item.id === id));
  
    return uniqueItems.slice(0, limit);
  }
  

  public async findBookCategoryList(category: string) {
    const data = await this.categoryService.findCategoryIdsByMall(category);

    const categoryIds = data.map((cat) => cat.id);

    const bookCategories = await this.bookCategoryService.findBooksByCategoryIds(categoryIds);

    const uniqueBookIds = [...new Set(bookCategories.map((item) => item.bookId))];
    return this.booksService.findBooksByIds(uniqueBookIds);
  }
}
