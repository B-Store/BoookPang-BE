import { Test, TestingModule } from '@nestjs/testing';
import { CartBooksService } from './cart-books.service';
import { ShoppingCartService } from '../../modules/shopping-cart/shopping-cart.service';
import { BooksService } from '../../modules/books/books.service';

describe('CartBooksService', () => {
  let service: CartBooksService;
  let mockShoppingCartService: jest.Mocked<ShoppingCartService>;
  let mockBookService: jest.Mocked<BooksService>;
  beforeEach(async () => {
    mockShoppingCartService = {} as unknown as jest.Mocked<ShoppingCartService>;

    mockBookService = {} as unknown as jest.Mocked<BooksService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartBooksService,
        {
          provide: ShoppingCartService,
          useValue: mockShoppingCartService,
        },
        {
          provide: BooksService,
          useValue: mockBookService,
        },
      ],
    }).compile();

    service = module.get<CartBooksService>(CartBooksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
