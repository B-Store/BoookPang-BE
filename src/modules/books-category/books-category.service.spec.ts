import { Test, TestingModule } from '@nestjs/testing';
import { BooksCategoryService } from './books-category.service';
import { BooksCategoryEntity } from '../../entities/books-category.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('BooksCategoryService', () => {
  let service: BooksCategoryService;
  let mockBooksCategoryRepository: jest.Mocked<BooksCategoryEntity>;
  beforeEach(async () => {
    mockBooksCategoryRepository = {} as unknown as jest.Mocked<BooksCategoryEntity>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksCategoryService,
        {
          provide: getRepositoryToken(BooksCategoryEntity),
          useValue: mockBooksCategoryRepository,
        },
      ],
    }).compile();

    service = module.get<BooksCategoryService>(BooksCategoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
