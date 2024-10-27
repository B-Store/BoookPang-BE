import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Vonage } from '@vonage/server-sdk';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersEntity } from '../../entities/users.entity';
import { RefreshTokensEntity } from '../../entities/refresh-tokens.entity';
import { TermsOfServiceEntity } from '../../entities/terms_of_service.entity';
import * as bcrypt from 'bcrypt';

const dummyUserEntity = {
  loginId: 'bookPang@bookpang.com',
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
  let vonage: Vonage;
  let mockUsersRepository: Partial<Repository<UsersEntity>>;
  let mockRefreshTokensRepository: Partial<Repository<RefreshTokensEntity>>;
  let mockTermsOfServiceRepository: Partial<Repository<TermsOfServiceEntity>>;
  let mockConfigService: Partial<ConfigService>;
  let mockCacheManager: Partial<Cache>;

  beforeEach(async () => {
    mockUsersRepository = {
      find: jest.fn(),
      findOne: jest.fn().mockResolvedValue(dummyUserEntity),
      save: jest.fn(),
    };

    mockTermsOfServiceRepository = {
      save: jest.fn()
    }

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
          // case 'ACCESS_TOKEN_SECRET':
          //   return 'test_secret';
          // case 'JWT_ACCESS_TOKEN_EXPIRATION':
          //   return '1h';
          // case 'REFRESH_TOKEN_SECRET':
          //   return 'refresh_token_secret';
          // case 'JWT_REFRESH_TOKEN_EXPIRATION':
          //   return '7d';
          default:
            return null;
        }
      }),
    };
    
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
          provide: getRepositoryToken(TermsOfServiceEntity),
          useValue: mockTermsOfServiceRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: getRepositoryToken(RefreshTokensEntity),
          useValue: mockRefreshTokensRepository,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    vonage = module.get<Vonage>(Vonage);
  });

  describe('sendVerificationCode', () => {
    it('should throw NotFoundException if phoneNumber is empty', async () => {
      const phoneDto = {phoneNumber : ''};

      expect(service.sendVerificationCode(phoneDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if phoneNumber does not start with 010', async () => {
      const phoneDto = {phoneNumber : '010123'};

      expect(service.sendVerificationCode(phoneDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if phoneNumber does not start with 011', async () => {
      const phoneDto = {phoneNumber : '01112345678'};
      
      expect(service.sendVerificationCode(phoneDto)).rejects.toThrow(BadRequestException);
    });

    it('should send a verification code', async () => {
      const phoneDto = { phoneNumber: '01012345678' };
      const verificationCode = 123456;

      jest.spyOn(Math, 'random').mockReturnValue(0.123456);
      jest.spyOn(mockCacheManager, 'set').mockResolvedValue(undefined);
      mockCacheManager.set(phoneDto.phoneNumber, verificationCode, 300000);

      await service.sendVerificationCode(phoneDto);

      expect(mockCacheManager.set).toHaveBeenCalledWith(phoneDto.phoneNumber, verificationCode, 300000);
      expect(vonage.sms.send).toHaveBeenCalled();
    });
  });

  describe('phoneNumberValidator', () => {
    it('should throw BadRequestException for empty phone number', async () => {
      const verifyCodeDto = {
        phoneNumber : '',
        verificationCode :Number()
      }

      expect(service.phoneNumberValidator(verifyCodeDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for phone number that does not start with 010 or 011', async () => {
      const verifyCodeDto = {
        phoneNumber : '01012345678',
        verificationCode :Number()
      }

      expect(service.phoneNumberValidator(verifyCodeDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for incorrect verification code', async () => {
      const verifyCodeDto = {
        phoneNumber : '01012345678',
        verificationCode :Number(654321)
      }

      expect(service.phoneNumberValidator(verifyCodeDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should validate phone number and verification code successfully', async () => {
      const verifyCodeDto = {
        phoneNumber : '01012345678',
        verificationCode :Number(123456)
      }

      expect(
        service.phoneNumberValidator(verifyCodeDto),
      ).resolves.toBeUndefined();
      expect(mockCacheManager.del).toHaveBeenCalledWith(verifyCodeDto.phoneNumber);
      expect(mockCacheManager.get).toHaveBeenCalledWith(verifyCodeDto.phoneNumber);
    });
  });

  describe('checkExternalId', () => {
    it('should throw BadRequestException if externalId is empty', async () => {
      const externalId = '';
      expect(service.checkExternalId(externalId)).rejects.toThrow(BadRequestException);
    });

    it('should return undefined if loginId is available', async () => {
      const externalId = 'bookPang@naver.com';

      mockUsersRepository.findOne = jest.fn().mockResolvedValue(null);

      expect(service.checkExternalId(externalId)).resolves.toBeNull();
      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({
        where: { externalId, deletedAt: null },
      });externalId
    });

    it('should throw BadRequestException if externalId already exists', async () => {
      const externalId = 'example@gmail.com';

      expect(service.checkExternalId(externalId)).rejects.toThrow(BadRequestException);
      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({
        where: { externalId, deletedAt: null },
      });
    });
  });

  describe('userCreate', () => {
    it('should throw BadRequestException if createUserDto is empty', async () => {
      const createUserDto = {
        externalId: '',
        nickname: '',
        password: '',
        phoneNumber: '',
        termsOfService: {
          serviceTerms: true, 
          privacyPolicy: true,
          carrierTerms: true,
          identificationInfoPolicy: true,
          verificationServiceTerms:true
        }
      };

      expect(service.userCreate(createUserDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if createUserDto is empty', async () => {
      const createUserDto = {
        externalId: 'bookPang@bookpang.com',
        nickname: '',
        password: '',
        phoneNumber: '',
        termsOfService: {
          serviceTerms: true, 
          privacyPolicy: true,
          carrierTerms: true,
          identificationInfoPolicy: true,
          verificationServiceTerms:true
        }
      };

      expect(service.userCreate(createUserDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if createUserDto is empty', async () => {
      const createUserDto = {
        externalId: 'bookPang@bookpang.com',
        nickname: 'bookPang',
        password: '',
        phoneNumber: '',
        termsOfService: {
          serviceTerms: true, 
          privacyPolicy: true,
          carrierTerms: true,
          identificationInfoPolicy: true,
          verificationServiceTerms:true
        }
      };

      expect(service.userCreate(createUserDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if createUserDto is empty', async () => {
      const createUserDto = {
        externalId: 'bookPang@bookpang.com',
        nickname: 'bookPang',
        password: '',
        phoneNumber: '',
        termsOfService: {
          serviceTerms: true, 
          privacyPolicy: true,
          carrierTerms: true,
          identificationInfoPolicy: true,
          verificationServiceTerms:true
        }
      };
      service['userAuthStates'] = {
        [createUserDto.phoneNumber]: { isVerified: false },
      };
      
      expect(service.userCreate(createUserDto)).rejects.toThrow(BadRequestException);
    });

    it('should successfully create a user if all data is valid and phone number is verified', async () => {
      const createUserDto = {
        externalId: 'bookPang@bookpang.com',
        nickname: 'bookPang',
        password: 'bookpang12345',
        phoneNumber: '01012345678',
        termsOfService: {
          serviceTerms: true, 
          privacyPolicy: true,
          carrierTerms: true,
          identificationInfoPolicy: true,
          verificationServiceTerms:true
        }
      };

      service['userAuthStates'] = {
        [createUserDto.phoneNumber]: { isVerified: false },
      };
    
      service['userAuthStates'][createUserDto.phoneNumber].isVerified = true;
    
      service.checkExternalId = jest.fn().mockResolvedValue(null);
      mockUsersRepository.save = jest.fn().mockResolvedValue(dummyUserEntity);
      mockTermsOfServiceRepository.save = jest.fn().mockResolvedValue(undefined);

      const result = await service.userCreate(createUserDto);

      expect(result).toEqual(dummyUserEntity);
      expect(mockUsersRepository.save).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should throw BadRequestException if both externalId and password are empty', async () => {
      const logInDto = {
        externalId: '',
        password: '',
      };

      expect(service.logIn(logInDto)).rejects.toThrow(BadRequestException)
    });

    it('should throw BadRequestException if password is empty', async () => {
      const logInDto = {
        externalId: 'bookpang@bookpang.com',
        password: '',
      };
    
      expect(service.logIn(logInDto)).rejects.toThrow(BadRequestException);
    });
    

    it('should throw BadRequestException if externalId is empty', async () => {
      const logInDto = {
        externalId: '',
        password: 'bookpang12345',
      };

      expect(service.logIn(logInDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if externalId does not exist', async () => {
      const logInDto = {
        externalId: 'bookPang@naver.com',
        password: 'bookpang12345',
      };

      mockUsersRepository.findOne = jest.fn().mockResolvedValue(null);
      expect(service.logIn(logInDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const logInDto = {
        externalId: 'bookPang@naver.com',
        password: 'bookpang12345',
      };

      mockUsersRepository.findOne = jest.fn().mockResolvedValue(dummyUserEntity);
      (bcrypt.compare as jest.Mock) = jest.fn().mockResolvedValue(false);

      expect(service.logIn(logInDto)).rejects.toThrow(UnauthorizedException);
      expect(bcrypt.compare).toHaveBeenCalledWith(logInDto.password, dummyUserEntity.password);
    });
  });
});
