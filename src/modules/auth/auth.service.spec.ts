import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Vonage } from '@vonage/server-sdk';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Auth } from '@vonage/auth';
import { AuthService } from './auth.service';
import { UsersEntity } from '../../entities/users.entity';
import { RefreshTokensEntity } from '../../entities/refresh-tokens.entity';
import { AccessTokenStrategy, RefreshTokenStrategy } from './jwt-strategy';
import * as bcrypt from 'bcrypt';

const createMockVonage = (mockConfigService: Partial<ConfigService>) => {
  const credentials = new Auth({
    apiKey: mockConfigService.get<string>('VONAGE_API_KEY'),
    apiSecret: mockConfigService.get<string>('VONAGE_API_SECRET'),
  });
  return new Vonage(credentials);
};

const dummyUserEntity = {
  loginId: 'example@gmail.com',
  nickname: 'bookPang',
  password: '$2b$10$owOYi78x/7h5w28OWMKAAuCgNH6GEFkQL53l.UX0eXXTymyh8okCW',
  phoneNumber: '010111111111',
  address: null,
  id: 1,
  provider: 'LOCAL',
  createdAt: new Date(),
  updatedAt: null,
  deletedAt: null,
};

describe('AuthService', () => {
  let service: AuthService;
  let mockUsersRepository: Partial<Repository<UsersEntity>>;
  let mockRefreshTokensRepository: Partial<Repository<RefreshTokensEntity>>;
  let mockConfigService: Partial<ConfigService>;
  let mockCacheManager: Partial<Cache>;

  beforeEach(async () => {
    mockUsersRepository = {
      find: jest.fn(),
      findOne: jest.fn().mockResolvedValue(dummyUserEntity),
      save: jest.fn(),
    };

    mockRefreshTokensRepository = {
      upsert: jest.fn(),
    };

    mockCacheManager = {
      get: jest.fn().mockResolvedValue(123456),
      set: jest.fn(),
      del: jest.fn(),
    };

    mockConfigService = {
      get: jest.fn((key: string) => {
        switch (key) {
          case 'VONAGE_API_KEY':
            return 'test_api_key';
          case 'VONAGE_API_SECRET':
            return 'test_api_secret';
          case 'VONAGE_SENDER_NUMBER':
            return 'test_sender_number';
          case 'ACCESS_TOKEN_SECRET':
            return 'test_secret';
          case 'JWT_ACCESS_TOKEN_EXPIRATION':
            return '1h';
          case 'REFRESH_TOKEN_SECRET':
            return 'refresh_token_secret';
          case 'JWT_REFRESH_TOKEN_EXPIRATION':
            return '7d';
          default:
            return null;
        }
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(UsersEntity),
          useValue: mockUsersRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        JwtService,
        AccessTokenStrategy,
        RefreshTokenStrategy,
        {
          provide: getRepositoryToken(RefreshTokensEntity),
          useValue: mockRefreshTokensRepository,
        },
        {
          provide: Vonage,
          useValue: createMockVonage(mockConfigService),
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendVerificationCode', () => {
    it('should throw NotFoundException if phoneNumber is empty', async () => {
      const phoneNumber = '';
      await expect(service.sendVerificationCode(phoneNumber)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if phoneNumber does not start with 010', async () => {
      const phoneNumber = '010123';
      await expect(service.sendVerificationCode(phoneNumber)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if phoneNumber does not start with 011', async () => {
      const phoneNumber = '01112345678';
      await expect(service.sendVerificationCode(phoneNumber)).rejects.toThrow(BadRequestException);
    });
  });

  describe('phoneNumberValidator', () => {
    it('should throw BadRequestException for empty phone number', async () => {
      const phoneNumber = '';
      const verificationCode = Number();
      await expect(service.phoneNumberValidator(phoneNumber, verificationCode)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for invalid phone number format', async () => {
      const phoneNumber = '01012345678';
      const verificationCode = Number();
      await expect(service.phoneNumberValidator(phoneNumber, verificationCode)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for incorrect verification code', async () => {
      const phoneNumber = '01012345678';
      const verificationCode = 654321;

      await expect(service.phoneNumberValidator(phoneNumber, verificationCode)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should validate phone number and verification code successfully', async () => {
      const phoneNumber = '01012345678';
      const verificationCode = 123456;

      await expect(
        service.phoneNumberValidator(phoneNumber, verificationCode),
      ).resolves.toBeUndefined();
      expect(mockCacheManager.del).toHaveBeenCalledWith(phoneNumber);
      expect(mockCacheManager.get).toHaveBeenCalledWith(phoneNumber);
    });
  });

  describe('checkLoginIdAvailability', () => {
    it('should throw BadRequestException if loginId is empty', async () => {
      const loginId = '';
      await expect(service.checkLoginIdAvailability(loginId)).rejects.toThrow(BadRequestException);
    });

    it('should return undefined if loginId is available', async () => {
      const loginId = 'bookPang@naver.com';

      mockUsersRepository.findOne = jest.fn().mockResolvedValue(null);

      await expect(service.checkLoginIdAvailability(loginId)).resolves.toBeNull();
      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({
        where: { loginId, deletedAt: null },
      });
    });

    it('should throw BadRequestException if loginId is empty', async () => {
      const loginId = 'example@gmail.com';

      await expect(service.checkLoginIdAvailability(loginId)).rejects.toThrow(BadRequestException);
      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({
        where: { loginId, deletedAt: null },
      });
    });
  });

  describe('userCreate', () => {
    it('should throw BadRequestException if createUserDto is empty', async () => {
      const createUserDto = {
        loginId: '',
        nickname: '',
        password: '',
        phoneNumber: '',
      };

      await expect(service.userCreate(createUserDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if createUserDto is empty', async () => {
      const createUserDto = {
        loginId: 'bookPang@naver.com',
        nickname: '',
        password: '',
        phoneNumber: '',
      };

      await expect(service.userCreate(createUserDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if createUserDto is empty', async () => {
      const createUserDto = {
        loginId: 'bookPang@naver.com',
        nickname: 'bookPang',
        password: '',
        phoneNumber: '',
      };

      await expect(service.userCreate(createUserDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if createUserDto is empty', async () => {
      const createUserDto = {
        loginId: 'bookPang@naver.com',
        nickname: 'bookPang',
        password: 'password',
        phoneNumber: '01012345678',
      };
      service['checkLoginIdAvailability'] = jest.fn().mockResolvedValue(null);
      mockUsersRepository.save = jest.fn().mockResolvedValue(dummyUserEntity);
      await expect(service.userCreate(createUserDto)).resolves.toEqual(dummyUserEntity);
    });
  });

  describe('login', () => {
    it('should throw BadRequestException if loginId, password is empty', async () => {
      const logInDto = {
        loginId: '',
        password: '',
      };

      await expect(service.logIn(logInDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if password is empty', async () => {
      const logInDto = {
        loginId: 'bookPang@naver.com',
        password: '',
      };

      await expect(service.logIn(logInDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if loginId is empty', async () => {
      const logInDto = {
        loginId: '',
        password: 'password',
      };

      await expect(service.logIn(logInDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if loginId is empty', async () => {
      const logInDto = {
        loginId: 'bookPang@naver.com',
        password: 'password',
      };

      mockUsersRepository.findOne = jest.fn().mockResolvedValue(null);
      await expect(service.logIn(logInDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if password is invalid', async () => {
      const logInDto = {
        loginId: 'bookPang@naver.com',
        password: 'password',
      };

      mockUsersRepository.findOne = jest.fn().mockResolvedValue(dummyUserEntity);
      (bcrypt.compare as jest.Mock) = jest.fn().mockResolvedValue(false);

      await expect(service.logIn(logInDto)).rejects.toThrow(UnauthorizedException);
      expect(bcrypt.compare).toHaveBeenCalledWith(logInDto.password, dummyUserEntity.password);
    });
  });
});
