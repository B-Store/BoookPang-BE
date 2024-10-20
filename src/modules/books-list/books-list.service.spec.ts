import { Test, TestingModule } from '@nestjs/testing';
import { BooksListService } from './books-list.service';

describe('BooksListService', () => {
  let service: BooksListService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BooksListService],
    }).compile();

    service = module.get<BooksListService>(BooksListService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
