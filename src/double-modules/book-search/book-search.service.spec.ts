import { Test, TestingModule } from '@nestjs/testing';
import { BookSearchService } from './book-search.service';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { BooksService } from '../../modules/books/books.service';

describe('BookSearchService', () => {
  let service: BookSearchService;
  let mockElasticsearchService: jest.Mocked<ElasticsearchService>;
  let mockBooksService: jest.Mocked<BooksService>;

  beforeEach(async () => {

    mockBooksService = {
      findAllBooks: jest.fn(),

    } as unknown as jest.Mocked<BooksService>;

    mockElasticsearchService = {
      search: jest.fn(),
      indices: {
        exists: jest.fn(),
        create: jest.fn(),
      },
      index: jest.fn(),
      exists: jest.fn(),
    } as unknown as jest.Mocked<ElasticsearchService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookSearchService,
        {
          provide: BooksService,
          useValue: mockBooksService,
        },
        {
          provide: ElasticsearchService,
          useValue: mockElasticsearchService,
        }
      ],
    }).compile();

    service = module.get<BookSearchService>(BookSearchService);
  });
  
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // describe('onModuleInit', () => {
  //   it('should call deleteIndex, createIndex, and indexAllBooks on module init', async () => {
  //     mockBooksService.findAllBooks = jest.fn().mockResolvedValue([]);
  
  //     service.deleteIndex = jest.fn();
  //     service.createIndex = jest.fn();
  //     service.indexAllBooks = jest.fn();
  
  //     await service.onModuleInit();
  
  //     // 각 메서드가 호출되었는지 확인
  //     expect(service.deleteIndex).toHaveBeenCalledTimes(2);
  //     expect(service.createIndex).toHaveBeenCalledTimes(2);
  //     expect(service.indexAllBooks).toHaveBeenCalled();
  //   });
  // });
  // describe('findBooks', () => {
  //   it('should throw NotFoundException when no books are found', async () => {
  //     const title = 'non-existent book';
  //     mockBooksRepository.find.mockResolvedValue([]);
  //     await expect(service.findBooks(title)).rejects.toThrow(NotFoundException);
  //   });
  // });

  // describe('search', () => {
  //   it('should throw NotFoundException when no books are found in Elasticsearch', async () => {
  //     const query = {
  //       query: {
  //         match: {
  //           title: {
  //             query: 'non-existent book',
  //             fuzziness: 1,
  //           },
  //         },
  //       },
  //     };
  //     const elasticsearchResult = {
  //       hits: {
  //         hits: [],
  //       },
  //     };
  //     mockElasticsearchService.search.mockResolvedValue(elasticsearchResult);

  //     await expect(service.search(query)).rejects.toThrow(NotFoundException);
  //   });
  // });
});
