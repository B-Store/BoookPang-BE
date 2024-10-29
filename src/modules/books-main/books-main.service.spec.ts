import { Test, TestingModule } from '@nestjs/testing';
import { BooksMainService } from './books-main.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BooksEntity } from '../../entities/books.entity';
import { CategoryEntity } from '../../entities/category.entity';
import { BooksCategoryEntity } from '../../entities/books-category.entity';
import { OrderModule } from '../order/order.module';
import { OrderService } from '../order/order.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('BooksMainService', () => {
  let service: BooksMainService;
  let mockBooksRepository: Partial<Repository<BooksEntity>>;
  let mockCategoryRepository: Partial<Repository<CategoryEntity>>;
  let mockBooksCategoryRepository: Partial<Repository<BooksCategoryEntity>>;
  let mockOrderService: OrderService;
  let mockCacheManager: Partial<Cache>;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksMainService,
        { provide: getRepositoryToken(BooksEntity), useValue: mockBooksRepository },
        { provide: getRepositoryToken(CategoryEntity), useValue: mockCategoryRepository },
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
