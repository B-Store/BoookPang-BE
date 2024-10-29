import { Test, TestingModule } from '@nestjs/testing';
import { CartsService } from './carts.service';
import { CartsEntity } from '../../entities/carts.entity';
import { BooksEntity } from '../../entities/books.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

describe('CartsService', () => {
  let service: CartsService;
  let mockCartsRepository: jest.Mocked<Repository<CartsEntity>>;
  let mockBooksRepository: jest.Mocked<Repository<BooksEntity>>;

  beforeEach(async () => {
    mockCartsRepository = {
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
    } as unknown as jest.Mocked<Repository<CartsEntity>>;

    mockBooksRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Repository<BooksEntity>>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartsService,
        {
          provide: getRepositoryToken(CartsEntity),
          useValue: mockCartsRepository,
        },
        {
          provide: getRepositoryToken(BooksEntity),
          useValue: mockBooksRepository,
        },
      ],
    }).compile();

    service = module.get<CartsService>(CartsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // 추가 테스트 케이스를 여기에 작성하세요.
});
