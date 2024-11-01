import { Test, TestingModule } from '@nestjs/testing';
import { BookDetailService } from './book-detail.service';

describe('BookDetailService', () => {
  let service: BookDetailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BookDetailService],
    }).compile();

    service = module.get<BookDetailService>(BookDetailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
