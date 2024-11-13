import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { BooksCategoryService } from '../../modules/books-category/books-category.service';
import { BooksService } from '../../modules/books/books.service';
import { CategoryService } from '../../modules/category/category.service';
import { OrderService } from '../../modules/order/order.service';
import { ReviewService } from '../../modules/review/review.service';

@Injectable()
export class BookListService {
  constructor(
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    private booksService: BooksService,
    private categoryService: CategoryService,
    private bookCategoryService: BooksCategoryService,
    private orderService: OrderService,
    private reviewsService: ReviewService,
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

  public async findNewBooks({ page, limit, category }) {
    const skip = (page - 1) * limit;
    const cacheKey = `new-books:${page}:${limit}:${category}`;

    const cachedData = await this.cacheManager.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const [books, total] = await this.booksService.findBooksByCategory({ skip, limit, category });

    const result = {
      data: books,
      total,
      page,
      limit,
    };

    await this.cacheManager.set(cacheKey, result, 300000);

    return result;
  }

  public async findBestsellers({ page, limit, category }) {
    const skip = (page - 1) * limit;
    const cacheKey = `bestsellers:${page}:${limit}:${category}`;

    const cachedData = await this.cacheManager.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const [books] = await this.booksService.findBooksByCategory({ category, skip, limit });

    const aggregatedData = await this.orderService.getTotalSalesForBooks(
      books.map((book) => book.id),
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

  public async findItemNewSpecial(limit: number) {
    return this.booksService.findItemNewSpecial(limit);
  }

  // 추후에 수정
  public async findBookCategoryList(category: string) {
    const data = await this.categoryService.findCategoryIdsByMall(category);

    const categoryIds = data.map((cat) => cat.id);

    const bookCategories = await this.bookCategoryService.findBooksByCategoryIds(categoryIds);

    const uniqueBookIds = [...new Set(bookCategories.map((item) => item.bookId))];
    return this.booksService.findBooksByIds(uniqueBookIds);
  }

  public async findBooksCategoryId({ categoryId, page, limit }) {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);

    const booksCategoryData = await this.bookCategoryService.findCategoryId(categoryId);
    const allBooks = await this.booksService.findBooksIds(
      booksCategoryData.map((book) => book.bookId),
    );

    const paginatedBooks = allBooks.slice(startIndex, endIndex);

    const booksWithReviewCount = await Promise.all(
      paginatedBooks.map(async (book) => {
        const reviewCount = await this.reviewsService.findReviewCount(book.id);
        return {
          ...book,
          reviewCount,
        };
      }),
    );
    return {
      total: allBooks.length,
      page,
      limit,
      books: booksWithReviewCount,
    };
  }
}
