import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BooksEntity } from '../../entities/books.entity';
import { In, Repository } from 'typeorm';
import { ReviewEntity } from '../../entities/reviews.entity';
import { BooksCategoryEntity } from '../../entities/books-category.entity';
import { CategoryEntity } from '../../entities/category.entity';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(BooksEntity)
    private readonly bookRepository: Repository<BooksEntity>,
    @InjectRepository(ReviewEntity)
    private readonly reviewRepository: Repository<ReviewEntity>,
    @InjectRepository(BooksCategoryEntity)
    private readonly booksCategoryRepository: Repository<BooksCategoryEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
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

    const reviewCount = await this.reviewRepository.count({
      where: { bookId: book.id },
    });

    const reviewStars = await this.reviewRepository.find({ where: { bookId } });

    const totalStars = reviewStars.reduce((sum: number, review) => sum + review.stars, 0);
    const averageRating = totalStars / reviewStars.length;
    const averageRatingForFrontend = Math.round(averageRating * 2 * 10) / 10;

    const bookCategories = await this.booksCategoryRepository.find({ where: { bookId: book.id } });
    const categoryIds = bookCategories.map((bookCategory) => bookCategory.categoryId);

    const [categories] = await this.categoryRepository.find({
      where: { id: In(categoryIds) },
    });

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
