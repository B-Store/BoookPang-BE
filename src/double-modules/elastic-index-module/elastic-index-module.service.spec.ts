import { Test, TestingModule } from '@nestjs/testing';
import { ElasticIndexModuleService } from './elastic-index-module.service';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { BooksService } from '../../modules/books/books.service';
import { WishlistsService } from '../../modules/wishlists/wishlists.service';
import { ReviewService } from '../../modules/review/review.service';

describe('ElasticIndexModuleService', () => {
  let service: ElasticIndexModuleService;
  let mockElasticsearchService: jest.Mocked<ElasticsearchService>;
  let mockBooksService: jest.Mocked<BooksService>;
  let mockWishlistService: jest.Mocked<WishlistsService>;
  let mockReviewService: jest.Mocked<ReviewService>;

  beforeEach(async () => {
    mockElasticsearchService = {} as unknown as jest.Mocked<ElasticsearchService>;

    mockBooksService = {} as unknown as jest.Mocked<BooksService>;

    mockWishlistService = {} as unknown as jest.Mocked<WishlistsService>;

    mockReviewService = {} as unknown as jest.Mocked<ReviewService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ElasticIndexModuleService,
        {
          provide: ElasticsearchService,
          useValue: mockElasticsearchService,
        },
        {
          provide: BooksService,
          useValue: mockBooksService,
        },
        {
          provide: WishlistsService,
          useValue: mockWishlistService,
        },
        {
          provide: ReviewService,
          useValue: mockReviewService,
        },
      ],
    }).compile();

    service = module.get<ElasticIndexModuleService>(ElasticIndexModuleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
