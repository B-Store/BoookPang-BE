import { Test, TestingModule } from '@nestjs/testing';
import { ReviewService } from './review.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ReviewEntity } from './entities/reviews.entity';
import { Repository } from 'typeorm';
import { BooksService } from '../books/books.service';

describe('ReviewService', () => {
  let service: ReviewService;
  let mockReviewRepository: jest.Mocked<ReviewEntity>;

  beforeEach(async () => {

    mockReviewRepository = {

    } as unknown as jest.Mocked<ReviewEntity>

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewService,
        { provide: getRepositoryToken(ReviewEntity), useValue: mockReviewRepository },
      ],
    }).compile();

    service = module.get<ReviewService>(ReviewService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
