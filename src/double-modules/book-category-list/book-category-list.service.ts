import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { BooksCategoryService } from '../../modules/books-category/books-category.service';
import { BooksService } from '../../modules/books/books.service';
import { CategoryService } from '../../modules/category/category.service';
import { ReviewService } from '../../modules/review/review.service';

@Injectable()
export class BookCategoryListService {
  constructor(
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    private booksService: BooksService,
    private categoryService: CategoryService,
    private bookCategoryService: BooksCategoryService,
    private reviewsService: ReviewService,
  ) {}

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
