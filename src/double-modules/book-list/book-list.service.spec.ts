import { Test, TestingModule } from '@nestjs/testing';
import { BookListService } from './book-list.service';

describe('BookListService', () => {
  let service: BookListService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BookListService],
    }).compile();

    service = module.get<BookListService>(BookListService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
