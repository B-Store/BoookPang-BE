import { Repository } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BooksListService } from './books-list.service';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { BooksEntity } from '../../entities/books.entity';
import { BooksCategoryEntity } from '../../entities/books-category.entity';
import { CategoryEntity } from '../../entities/category.entity';

describe('BooksListService', () => {
  let service: BooksListService;
  let mockbooksRepository: Partial<Repository<BooksEntity>>;
  let mockBooksCategoryRepository: Partial<Repository<BooksCategoryEntity>>;
  let mockElasticsearchService: ElasticsearchService;
  let mockCategoryRepository:Partial<Repository<CategoryEntity>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksListService,
        { provide: getRepositoryToken(BooksEntity), useValue: mockbooksRepository },
        { provide: getRepositoryToken(BooksCategoryEntity), useValue: mockBooksCategoryRepository },
        {provide: getRepositoryToken(CategoryEntity), useValue: mockCategoryRepository},
        { provide: ElasticsearchService, useValue: mockElasticsearchService },
      ],
    }).compile();

    service = module.get<BooksListService>(BooksListService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
