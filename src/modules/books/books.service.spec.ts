import { Test, TestingModule } from '@nestjs/testing';
import { BooksService } from './books.service';
import { BooksEntity } from './entities/books.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryService } from '../category/category.service';
import { BooksCategoryService } from '../books-category/books-category.service';
import { ReviewService } from '../review/review.service';

describe('BooksService', () => {
  let service: BooksService;
  let mockBooksRepository: jest.Mocked<Repository<BooksEntity>>;
  let mockCategoryService: jest.Mocked<CategoryService>;
  let mockBooksCategoryService: jest.Mocked<BooksCategoryService>;
  let mockReviewService: jest.Mocked<ReviewService>;

  beforeEach(async () => {
    mockBooksRepository = {
      find: jest.fn(),
    } as unknown as jest.Mocked<Repository<BooksEntity>>;

    mockCategoryService = {
    } as unknown as jest.Mocked<CategoryService>;

    mockBooksCategoryService = {
    } as unknown as jest.Mocked<BooksCategoryService>;

    mockReviewService = {
    } as unknown as jest.Mocked<ReviewService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        {
          provide: getRepositoryToken(BooksEntity),
          useValue: mockBooksRepository,
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

    service = module.get<BooksService>(BooksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
