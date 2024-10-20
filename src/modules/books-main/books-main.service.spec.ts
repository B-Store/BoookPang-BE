import { Test, TestingModule } from '@nestjs/testing';
import { BooksMainService } from './books-main.service';

describe('BooksMainService', () => {
  let service: BooksMainService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BooksMainService],
    }).compile();

    service = module.get<BooksMainService>(BooksMainService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
