import { Test, TestingModule } from '@nestjs/testing';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BooksEntity } from '../../entities/books.entity';
import { Repository } from 'typeorm';
import { BooksCategoryEntity } from '../../entities/books-category.entity';
import { CategoryEntity } from '../../entities/category.entity';

describe('BooksController', () => {
  let controller: BooksController;
  let mockBooksService: Repository<BooksService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BooksController],
      providers: [
        {
          provide: BooksService,
          useValue: mockBooksService,
        },
        {
          provide: getRepositoryToken(BooksEntity),
          useValue: {},
        },
        {
          provide: getRepositoryToken(CategoryEntity),
          useValue: {},
        },
        {
          provide: getRepositoryToken(BooksCategoryEntity),
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<BooksController>(BooksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});