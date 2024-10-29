import { Test, TestingModule } from '@nestjs/testing';
import { RefreshTokenService } from './refresh-token.service';
import { RefreshTokensEntity } from '../../entities/refresh-tokens.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('RefreshTokenService', () => {
  let service: RefreshTokenService;
  let mockRefreshTokenRepository: jest.Mocked<Repository<RefreshTokensEntity>>;

  beforeEach(async () => {
    mockRefreshTokenRepository = {
    } as unknown as jest.Mocked<Repository<RefreshTokensEntity>>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenService,
        {
          provide: getRepositoryToken(RefreshTokensEntity),
          useValue: mockRefreshTokenRepository,
        },
      ],
    }).compile();

    service = module.get<RefreshTokenService>(RefreshTokenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
