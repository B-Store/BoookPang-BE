import { Test, TestingModule } from '@nestjs/testing';
import { BooksMainService } from './books-main.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BooksEntity } from '../../entities/books.entity';
import { BooksCategoryEntity } from '../../entities/books-category.entity';
import { OrderService } from '../order/order.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CategoryService } from '../category/category.service';

describe('BooksMainService', () => {
  let service: BooksMainService;
  let mockBooksRepository: jest.Mocked<Repository<BooksEntity>>;
  let mockCategoryService: jest.Mocked<CategoryService>
  let mockBooksCategoryRepository: jest.Mocked<Repository<BooksCategoryEntity>>;
  let mockOrderService: jest.Mocked<OrderService>;
  let mockCacheManager: jest.Mocked<Cache>;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksMainService,
        { provide: getRepositoryToken(BooksEntity), useValue: mockBooksRepository },
        { provide: CategoryService, useValue: mockCategoryService },
        { provide: getRepositoryToken(BooksCategoryEntity), useValue: mockBooksCategoryRepository },
        { provide: OrderService, useValue: mockOrderService },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<BooksMainService>(BooksMainService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
