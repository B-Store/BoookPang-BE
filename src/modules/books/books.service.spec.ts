import { Test, TestingModule } from '@nestjs/testing';
import { BooksService } from './books.service';
import { BooksEntity } from '../../entities/books.entity';
import { CategoryEntity } from '../../entities/category.entity';
import { BooksCategoryEntity } from '../../entities/books-category.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ReviewEntity } from '../../entities/reviews.entity';

describe('BooksService', () => {
  let service: BooksService;
  let mockBooksRepository: Partial<Repository<BooksEntity>>;
  let mockCategoryRepository: Partial<Repository<CategoryEntity>>;
  let mockBooksCategoryRepository: Partial<Repository<BooksCategoryEntity>>;
  let mockReviewRepository: Partial<Repository<ReviewEntity>>;
  let mockCacheManager: Partial<Cache>;

  beforeEach(async () => {
    mockBooksRepository = {
      find: jest.fn(),
    };

    mockCategoryRepository = {};

    mockBooksCategoryRepository = {};

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        {
          provide: getRepositoryToken(BooksEntity),
          useValue: mockBooksRepository,
        },
        {
          provide: getRepositoryToken(CategoryEntity),
          useValue: mockCategoryRepository,
        },
        {
          provide: getRepositoryToken(BooksCategoryEntity),
          useValue: mockBooksCategoryRepository,
        },
        { provide: getRepositoryToken(ReviewEntity), useValue: mockReviewRepository },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
