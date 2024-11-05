import { Test, TestingModule } from '@nestjs/testing';
import { BookDetailService } from './book-detail.service';
import { BooksService } from '../../modules/books/books.service';
import { CategoryService } from '../../modules/category/category.service';
import { BooksCategoryService } from '../../modules/books-category/books-category.service';
import { ReviewService } from '../../modules/review/review.service';

describe('BookDetailService', () => {
  let service: BookDetailService;
  let mockBooksService: jest.Mocked<BooksService>;
  let mockCategoryService: jest.Mocked<CategoryService>;
  let mockBooksCategoryService: jest.Mocked<BooksCategoryService>;
  let mockReviewService: jest.Mocked<ReviewService>;
  beforeEach(async () => {
    mockBooksService = {} as unknown as jest.Mocked<BooksService>;

    mockCategoryService = {} as unknown as jest.Mocked<CategoryService>;

    mockBooksCategoryService = {} as unknown as jest.Mocked<BooksCategoryService>;

    mockReviewService = {} as unknown as jest.Mocked<ReviewService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookDetailService,
        {
          provide: BooksService,
          useValue: mockBooksService,
        },
        {
          provide: CategoryService,
          useValue: mockCategoryService,
        },
        {
          provide: BooksCategoryService,
          useValue: mockBooksCategoryService,
        },
        {
          provide: ReviewService,
          useValue: mockReviewService,
        },
      ],
    }).compile();

    service = module.get<BookDetailService>(BookDetailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
