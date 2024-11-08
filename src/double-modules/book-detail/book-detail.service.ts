import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { BooksCategoryService } from '../../modules/books-category/books-category.service';
import { BooksService } from '../../modules/books/books.service';
import { CategoryService } from '../../modules/category/category.service';
import { ReviewService } from '../../modules/review/review.service';
import getLogger from '../../common/logger';

const logger = getLogger('book-detail')

@Injectable()
export class BookDetailService {

  constructor(
    private bookService: BooksService,
    private categoryService: CategoryService,
    private bookCategoryService: BooksCategoryService,
    private reviewService: ReviewService
  ) {}
  public async findBookDetall(bookId: number) {
    if (!bookId) {
      throw new BadRequestException('bookId 값을 확인해 주세요.');
    }

    const book = await this.bookService.findBook(bookId)
    logger.info('book data', book)
    if (!book) {
      throw new NotFoundException('book 관련 정보가 없습니다.');
    }

    const reviewCount = await this.reviewService.findReviewCount(book.id)
    const reviewStars = await this.reviewService.findBooksreiew(book.id)

    const totalStars = reviewStars.reduce((sum: number, review) => sum + review.stars, 0);
    const averageRating = totalStars / reviewStars.length;
    const averageRatingForFrontend = Math.round(averageRating * 2 * 10) / 10;

    const bookCategories = await this.bookCategoryService.findBooksByCategoryId(book.id)
    const categoryIds = bookCategories.map((bookCategory) => bookCategory.categoryId);

    const [categories] = await this.categoryService.findCategorys(categoryIds)

    return {
      ...book,
      reviewCount,
      categories,
      averageRatingForFrontend,
    };
  }
}
