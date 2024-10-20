import { Test, TestingModule } from '@nestjs/testing';
import { CartsService } from './carts.service';
import { CartsEntity } from '../../entities/carts.entity';
import { BooksEntity } from '../../entities/books.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';

describe('CartsService', () => {
  let service: CartsService;
  let mockCartsRepository: Partial<Repository<CartsEntity>>;
  let mockBooksRepository: Partial<Repository<BooksEntity>>;

  beforeEach(async () => {
    mockCartsRepository = {
      // 필요한 메서드를 추가하세요
    };

    mockBooksRepository = {
      // 필요한 메서드를 추가하세요
    };

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

  // 추가 테스트 케이스를 작성하세요.
});
