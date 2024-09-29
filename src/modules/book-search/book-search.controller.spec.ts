import { Test, TestingModule } from '@nestjs/testing';
import { BookSearchService } from './book-search.service';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BooksEntity } from '../../entities/books.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('BookSearchService', () => {
  let service: BookSearchService;
  let elasticsearchService: ElasticsearchService;
  let booksRepository: Repository<BooksEntity>;

  const mockBooksRepository = {
    find: jest.fn(),
  };

  const mockElasticsearchService = {
    search: jest.fn(),
    indices: {
      exists: jest.fn(),
      create: jest.fn(),
    },
    index: jest.fn(),
    exists: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookSearchService,
        {
          provide: getRepositoryToken(BooksEntity),
          useValue: mockBooksRepository,
        },
        {
          provide: ElasticsearchService,
          useValue: mockElasticsearchService,
        },
      ],
    }).compile();

    service = module.get<BookSearchService>(BookSearchService);
    elasticsearchService = module.get<ElasticsearchService>(ElasticsearchService);
    booksRepository = module.get<Repository<BooksEntity>>(getRepositoryToken(BooksEntity));
  });

  describe('findBooks', () => {
    it('should throw NotFoundException when no books are found', async () => {
      const title = 'non-existent book';
      mockBooksRepository.find.mockResolvedValue([]);
  
      await expect(service.findBooks(title)).rejects.toThrow(NotFoundException);
    });
  });

  describe('search', () => {
    it('should throw NotFoundException when no books are found in Elasticsearch', async () => {
      const query = {
        query: {
          match: {
            title: {
              query: 'non-existent book',
              fuzziness: 1,
            },
          },
        },
      };
      const elasticsearchResult = {
        hits: {
          hits: [],
        },
      };
      mockElasticsearchService.search.mockResolvedValue(elasticsearchResult);

      await expect(service.search(query)).rejects.toThrow(NotFoundException);
    });
  });
});