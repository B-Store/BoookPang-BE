import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Vonage } from '@vonage/server-sdk';
import { Cache } from 'cache-manager';
import { AuthService } from './auth.service';
import { UsersEntity } from './entities/users.entity';

const dummyUserEntity = {
  externalId: 'bookPang@bookpang.com',
  nickname: 'bookPang',
  password: '$2b$10$owOYi78x/7h5w28OWMKAAuCgNH6GEFkQL53l.UX0eXXTymyh8okCW',
  phoneNumber: '010111111111',
  address: null,
  id: 1,
  provider: 'LOCAL',
  createdAt: new Date(),
  updatedAt: null,
  deletedAt: null,
} as UsersEntity;

describe('AuthService', () => {
  let service: AuthService;
  let vonage: Vonage;
  let mockUsersRepository: jest.Mocked<Repository<UsersEntity>>;
  let mockConfigService: jest.Mocked<ConfigService>;
  let mockCacheManager: jest.Mocked<Cache>;
  let mockJwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    mockUsersRepository = {
      find: jest.fn(),
      findOne: jest.fn().mockResolvedValue(dummyUserEntity),
      save: jest.fn(),
    } as unknown as jest.Mocked<Repository<UsersEntity>>;

    mockCacheManager = {
      get: jest.fn().mockResolvedValue(123456),
      set: jest.fn(),
      del: jest.fn(),
    } as unknown as jest.Mocked<Cache>;

    mockJwtService = {
      sign: jest.fn(),
    } as unknown as jest.Mocked<JwtService>;

    mockConfigService = {
      get: jest.fn(),
    } as unknown as jest.Mocked<ConfigService>;

    const mockVonage = {
      sms: {
        send: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        JwtService,
        {
          provide: getRepositoryToken(UsersEntity),
          useValue: mockUsersRepository,
        },
        {
          provide: Vonage,
          useValue: mockVonage,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    service['userAuthStates'] = {};
    vonage = module.get<Vonage>(Vonage);
  });

  describe('sendVerificationCode', () => {
    it('should throw NotFoundException if phoneNumber is empty', async () => {
      const phoneDto = { phoneNumber: '' };

      expect(service.sendVerificationCode(phoneDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if phoneNumber does not start with 010', async () => {
      const phoneDto = { phoneNumber: '010123' };

      expect(service.sendVerificationCode(phoneDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if phoneNumber does not start with 011', async () => {
      const phoneDto = { phoneNumber: '01112345678' };

      expect(service.sendVerificationCode(phoneDto)).rejects.toThrow(BadRequestException);
    });

    it('should send a verification code', async () => {
      const phoneDto = { phoneNumber: '01012345678' };
      const verificationCode = 123456;

      jest.spyOn(Math, 'random').mockReturnValue(0.123456);
      jest.spyOn(mockCacheManager, 'set').mockResolvedValue(undefined);
      mockCacheManager.set(phoneDto.phoneNumber, verificationCode, 300000);

      await service.sendVerificationCode(phoneDto);

      expect(mockCacheManager.set).toHaveBeenCalledWith(
        phoneDto.phoneNumber,
        verificationCode,
        300000,
      );
      expect(vonage.sms.send).toHaveBeenCalled();
    });
  });

  describe('phoneNumberValidator', () => {
    it('should throw BadRequestException for empty phone number', async () => {
      const verifyCodeDto = {
        phoneNumber: '',
        verificationCode: Number(),
      };

      expect(service.phoneNumberValidator(verifyCodeDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for phone number that does not start with 010 or 011', async () => {
      const verifyCodeDto = {
        phoneNumber: '01012345678',
        verificationCode: Number(),
      };

      expect(service.phoneNumberValidator(verifyCodeDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for incorrect verification code', async () => {
      const verifyCodeDto = {
        phoneNumber: '01012345678',
        verificationCode: Number(654321),
      };

      expect(service.phoneNumberValidator(verifyCodeDto)).rejects.toThrow(BadRequestException);
    });

    it('should validate phone number and verification code successfully', async () => {
      const verifyCodeDto = {
        phoneNumber: '01012345678',
        verificationCode: Number(123456),
      };

      service['userAuthStates'][verifyCodeDto.phoneNumber] = { isVerified: false };

      await service.phoneNumberValidator(verifyCodeDto);

      expect(mockCacheManager.get).toHaveBeenCalledWith(verifyCodeDto.phoneNumber);
      expect(mockCacheManager.del).toHaveBeenCalledWith(verifyCodeDto.phoneNumber);
      expect(service['userAuthStates'][verifyCodeDto.phoneNumber].isVerified).toBe(true);
    });
  });

  describe('checkExternalId', () => {
    it('should throw BadRequestException if externalId is empty', async () => {
      const externalId = '';
      expect(service.findExternalId(externalId)).rejects.toThrow(BadRequestException);
    });

    it('should return undefined if loginId is available', async () => {
      const externalId = 'bookPang@naver.com';

      mockUsersRepository.findOne = jest.fn().mockResolvedValue(null);

      expect(service.findExternalId(externalId)).resolves.toBeNull();
      expect(mockUsersRepository.findOne).toHaveBeenCalled();
    });

    it('should throw BadRequestException if externalId already exists', async () => {
      const externalId = 'example@gmail.com';

      mockUsersRepository.findOne.mockResolvedValue(dummyUserEntity)

      const result = await service.findExternalId(externalId)
      expect(result).toBe(dummyUserEntity)
      expect(mockUsersRepository.findOne).toHaveBeenCalled();
    });
  });

  describe('checkNickName', () => {
    it('should throw BadRequestException if nickname already exists', async () => {
      const nickname = '';

      expect(service.checkNickName(nickname)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if user already exists', async () => {
      const nickname = 'bookPang';

      mockUsersRepository.findOne = jest.fn().mockResolvedValue(dummyUserEntity);

      expect(service.checkNickName(nickname)).rejects.toThrow(BadRequestException);
      expect(mockUsersRepository.findOne).toHaveBeenCalled();
    });

    it('should return null if nickname does not exist', async () => {
      const nickname = 'bookPang';

      mockUsersRepository.findOne = jest.fn().mockResolvedValue(null);

      expect(service.checkNickName(nickname)).resolves.toBeNull();
      expect(mockUsersRepository.findOne).toHaveBeenCalled();
    });
  });

  describe('checkUserForAuth', () => {
    it('should successfully checkUserForAuth is verified', async () => {
      const id = 1;
      mockUsersRepository.findOne = jest.fn().mockResolvedValue(dummyUserEntity);

      expect(service.checkUserForAuth({ id })).resolves.toEqual(dummyUserEntity);
    });
  });

  describe('userCreate', () => {
    it('should successfully userCreate is verified', async () => {
      const externalId = 'bookPang@bookpang.com';
      const nickname = 'bookpang1234';
      const password = 'bookpang12345';
      const phoneNumber = '01012345678';
      mockUsersRepository.save.mockResolvedValue(dummyUserEntity)
      const result = await service.userCreate({ externalId, nickname, password, phoneNumber });
      expect(result).toEqual(dummyUserEntity);
    });
  });

  describe('findUserPhoneNumber', () => {
    it('should successfully findUserPhoneNumber is verified', async () => {
      const password = 'bookpang12345';

      mockUsersRepository.findOne.mockResolvedValue(dummyUserEntity)

      const result = await service.findUserPhoneNumber(password);
      expect(result).toEqual(dummyUserEntity);
    });
  });
});
