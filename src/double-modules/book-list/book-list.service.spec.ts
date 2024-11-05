import { Test, TestingModule } from '@nestjs/testing';
import { BookListService } from './book-list.service';
import { BooksService } from '../../modules/books/books.service';
import { CategoryService } from '../../modules/category/category.service';
import { BooksCategoryService } from '../../modules/books-category/books-category.service';
import { OrderService } from '../../modules/order/order.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('BookListService', () => {
  let service: BookListService;
  let mockCacheManager: jest.Mocked<Cache>;
  let mockBooksService: jest.Mocked<BooksService>;
  let mockCategoryService: jest.Mocked<CategoryService>;
  let mockBookCategoryService: jest.Mocked<BooksCategoryService>;
  let mockOrderService: jest.Mocked<OrderService>;

  beforeEach(async () => {
    mockCacheManager = {} as unknown as jest.Mocked<Cache>;

    mockBooksService = {} as unknown as jest.Mocked<BooksService>;

    mockCategoryService = {} as unknown as jest.Mocked<CategoryService>;

    mockBookCategoryService = {} as unknown as jest.Mocked<BooksCategoryService>;

    mockOrderService = {} as unknown as jest.Mocked<OrderService>;
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookListService,
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
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
          useValue: mockBookCategoryService,
        },
        {
          provide: OrderService,
          useValue: mockOrderService,
        },
      ],
    }).compile();

    service = module.get<BookListService>(BookListService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
