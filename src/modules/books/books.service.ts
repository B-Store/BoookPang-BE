import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BooksEntity } from '../../entities/books.entity';
import { Repository } from 'typeorm';
import { ReviewEntity } from '../../entities/reviews.entity';
import { BooksCategoryEntity } from '../../entities/books-category.entity';
import { CategoryService } from '../category/category.service';
import { BooksCategoryService } from '../books-category/books-category.service';
import { ReviewService } from '../review/review.service';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(BooksEntity)
    private readonly bookRepository: Repository<BooksEntity>,
    private categoryService: CategoryService,
    private bookCategoryService: BooksCategoryService,
    private reviewService: ReviewService
  ) {}

  public async findBookDetall(bookId: number) {
    if (!bookId) {
      throw new BadRequestException('bookId 값을 확인해 주세요.');
    }

    const book = await this.bookRepository.findOne({
      where: { id: bookId },
    });

    if (!book) {
      throw new NotFoundException('book 관련 정보가 없습니다.');
    }

    const reviewCount = await this.reviewService.findReviewCount(book.id)

    const reviewStars = await this.reviewService.findBooksreiew(book.id)

    const totalStars = reviewStars.reduce((sum: number, review) => sum + review.stars, 0);
    const averageRating = totalStars / reviewStars.length;
    const averageRatingForFrontend = Math.round(averageRating * 2 * 10) / 10;

    const bookCategories = await this.bookCategoryService.findBooksCategory(book.id)
    const categoryIds = bookCategories.map((bookCategory) => bookCategory.categoryId);

    const [categories] = await this.categoryService.findCategorys(categoryIds)

    return {
      ...book,
      reviewCount,
      categories,
      averageRatingForFrontend,
    };
  }

  public async findBook(bookId: number) {
    return this.bookRepository.findOne({ where: { id: bookId } });
  }

  public async findAllBooks(){
    return this.bookRepository.find({
      select: [
        'id',
        'title',
        'author',
        'publisher',
        'regularPrice',
        'salePrice',
        'cover',
        'averageRating',
        'description',
        'createdAt'
      ],
    });
  }
}
