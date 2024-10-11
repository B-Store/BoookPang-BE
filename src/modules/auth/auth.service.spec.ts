import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { Repository } from 'typeorm';
import { UsersEntity } from '../../entities/users.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokensEntity } from '../../entities/refresh-tokens.entity';

describe('AuthService', () => {
  let service: AuthService;
  let mockUsersRepository: Partial<Repository<UsersEntity>>;

  beforeEach(async () => {
    mockUsersRepository = {
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(UsersEntity),
          useValue: mockUsersRepository,
        },
        ConfigService,
        JwtService,
        {
          provide: getRepositoryToken(RefreshTokensEntity),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});