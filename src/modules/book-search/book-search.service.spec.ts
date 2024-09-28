import { Test, TestingModule } from '@nestjs/testing';
import { BookSearchService } from './book-search.service';

describe('BookSearchService', () => {
  let service: BookSearchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BookSearchService],
    }).compile();

    service = module.get<BookSearchService>(BookSearchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
