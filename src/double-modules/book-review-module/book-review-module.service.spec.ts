import { Test, TestingModule } from '@nestjs/testing';
import { BookReviewModuleService } from './book-review-module.service';
import { ReviewService } from '../../modules/review/review.service';
import { BooksService } from '../../modules/books/books.service';

describe('BookReviewModuleService', () => {
  let service: BookReviewModuleService;
  let mockReviewService: jest.Mocked<ReviewService>;
  let mockBooksService: jest.Mocked<BooksService>;

  beforeEach(async () => {
    mockBooksService = {} as unknown as jest.Mocked<BooksService>;

    mockReviewService = {} as unknown as jest.Mocked<ReviewService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookReviewModuleService,
        {
          provide: BooksService,
          useValue: mockBooksService,
        },
        {
          provide: ReviewService,
          useValue: mockReviewService,
        },
      ],
    }).compile();

    service = module.get<BookReviewModuleService>(BookReviewModuleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
