import { Test, TestingModule } from '@nestjs/testing';
import { WishlistsService } from './wishlists.service';
import { Repository } from 'typeorm';
import { WishlistEntity } from './entities/wishlist.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('WishlistsService', () => {
  let service: WishlistsService;
  let mockWishlistRepository: jest.Mocked<Repository<WishlistEntity>>;

  beforeEach(async () => {
    mockWishlistRepository = {} as unknown as jest.Mocked<Repository<WishlistEntity>>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WishlistsService,
        {
          provide: getRepositoryToken(WishlistEntity),
          useValue: mockWishlistRepository,
        },
      ],
    }).compile();

    service = module.get<WishlistsService>(WishlistsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
