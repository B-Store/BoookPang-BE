import { Test, TestingModule } from '@nestjs/testing';
import { BookReviewModuleService } from './book-review-module.service';

describe('BookReviewModuleService', () => {
  let service: BookReviewModuleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BookReviewModuleService],
    }).compile();

    service = module.get<BookReviewModuleService>(BookReviewModuleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
