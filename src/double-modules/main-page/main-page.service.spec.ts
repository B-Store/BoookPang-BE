import { Test, TestingModule } from '@nestjs/testing';
import { MainPageService } from './main-page.service';
import { BooksService } from '../../modules/books/books.service';
import { BooksCategoryService } from '../../modules/books-category/books-category.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { OrderService } from '../../modules/order/order.service';

describe('MainPageService', () => {
  let service: MainPageService;
  let mockBooksService: jest.Mocked<BooksService>;
  let mockBooksCategoryService: jest.Mocked<BooksCategoryService>;
  let mockCacheManager: jest.Mocked<Cache>;
  let mockOrderService: jest.Mocked<OrderService>;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MainPageService,
        {
          provide: BooksService,
          useValue: mockBooksService,
        },
        {
          provide: BooksCategoryService,
          useValue: mockBooksCategoryService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
        {
          provide: OrderService,
          useValue: mockOrderService,
        },
      ],
    }).compile();

    service = module.get<MainPageService>(MainPageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
