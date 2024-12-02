import { Test, TestingModule } from '@nestjs/testing';
import { BookCategoryListService } from './book-category-list.service';
import { BooksService } from '../../modules/books/books.service';
import { CategoryService } from '../../modules/category/category.service';
import { BooksCategoryService } from '../../modules/books-category/books-category.service';
import { ReviewService } from '../../modules/review/review.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('BookCategoryListService', () => {
  let service: BookCategoryListService;
  let mockBooksService: jest.Mocked<BooksService>;
  let mockCategoryService: jest.Mocked<CategoryService>;
  let mockBooksCategoryService: jest.Mocked<BooksCategoryService>;
  let mockReviewService: jest.Mocked<ReviewService>;
  let mockCacheManager: jest.Mocked<Cache>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookCategoryListService,
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
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<BookCategoryListService>(BookCategoryListService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
