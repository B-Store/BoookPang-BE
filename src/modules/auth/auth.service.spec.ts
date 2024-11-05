import { BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Vonage } from '@vonage/server-sdk';
import { Cache } from 'cache-manager';
import { AuthService } from './auth.service';
import { RefreshTokenService } from '../refresh-token/refresh-token.service';
import { TermsOfServiceService } from '../terms-of-service/terms-of-service.service';
import { UsersEntity } from './entities/users.entity';
import { LogInDto } from './dto/log-in.dto';
import { AUTH_CONSTANT } from '../../common/auth.constant';
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
  let mockUsersRepository: jest.Mocked<Repository<UsersEntity>>;
  let mockRefreshTokensService: jest.Mocked<RefreshTokenService>;
  let mockTermsOfServiceService: jest.Mocked<TermsOfServiceService>;
  let mockConfigService: jest.Mocked<ConfigService>;
  let mockCacheManager: jest.Mocked<Cache>;
  let mockJwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    mockUsersRepository = {
      find: jest.fn(),
      findOne: jest.fn().mockResolvedValue(dummyUserEntity),
      save: jest.fn(),
    } as unknown as jest.Mocked<Repository<UsersEntity>>;

    mockRefreshTokensService = {
      findRefreshToken: jest.fn(),
      findUserRefreshToken: jest.fn(),
    } as unknown as jest.Mocked<RefreshTokenService>;

    mockTermsOfServiceService = {
      upsert: jest.fn(),
    } as unknown as jest.Mocked<TermsOfServiceService>;

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
          provide: TermsOfServiceService,
          useValue: mockTermsOfServiceService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: RefreshTokenService,
          useValue: mockRefreshTokensService,
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

  // describe('sendVerificationCode', () => {
  //   it('should throw NotFoundException if phoneNumber is empty', async () => {
  //     const phoneDto = { phoneNumber: '' };

  //     expect(service.sendVerificationCode(phoneDto)).rejects.toThrow(NotFoundException);
  //   });

  //   it('should throw BadRequestException if phoneNumber does not start with 010', async () => {
  //     const phoneDto = { phoneNumber: '010123' };

  //     expect(service.sendVerificationCode(phoneDto)).rejects.toThrow(BadRequestException);
  //   });

  //   it('should throw BadRequestException if phoneNumber does not start with 011', async () => {
  //     const phoneDto = { phoneNumber: '01112345678' };

  //     expect(service.sendVerificationCode(phoneDto)).rejects.toThrow(BadRequestException);
  //   });

  //   it('should send a verification code', async () => {
  //     const phoneDto = { phoneNumber: '01012345678' };
  //     const verificationCode = 123456;

  //     jest.spyOn(Math, 'random').mockReturnValue(0.123456);
  //     jest.spyOn(mockCacheManager, 'set').mockResolvedValue(undefined);
  //     mockCacheManager.set(phoneDto.phoneNumber, verificationCode, 300000);

  //     await service.sendVerificationCode(phoneDto);

  //     expect(mockCacheManager.set).toHaveBeenCalledWith(
  //       phoneDto.phoneNumber,
  //       verificationCode,
  //       300000,
  //     );
  //     expect(vonage.sms.send).toHaveBeenCalled();
  //   });
  // });

  // describe('phoneNumberValidator', () => {
  //   it('should throw BadRequestException for empty phone number', async () => {
  //     const verifyCodeDto = {
  //       phoneNumber: '',
  //       verificationCode: Number(),
  //     };

  //     expect(service.phoneNumberValidator(verifyCodeDto)).rejects.toThrow(BadRequestException);
  //   });

  //   it('should throw BadRequestException for phone number that does not start with 010 or 011', async () => {
  //     const verifyCodeDto = {
  //       phoneNumber: '01012345678',
  //       verificationCode: Number(),
  //     };

  //     expect(service.phoneNumberValidator(verifyCodeDto)).rejects.toThrow(BadRequestException);
  //   });

  //   it('should throw BadRequestException for incorrect verification code', async () => {
  //     const verifyCodeDto = {
  //       phoneNumber: '01012345678',
  //       verificationCode: Number(654321),
  //     };

  //     expect(service.phoneNumberValidator(verifyCodeDto)).rejects.toThrow(BadRequestException);
  //   });

  //   it('should validate phone number and verification code successfully', async () => {
  //     const verifyCodeDto = {
  //       phoneNumber: '01012345678',
  //       verificationCode: Number(123456),
  //     };

  //     service['userAuthStates'][verifyCodeDto.phoneNumber] = { isVerified: false };

  //     await service.phoneNumberValidator(verifyCodeDto);

  //     expect(mockCacheManager.get).toHaveBeenCalledWith(verifyCodeDto.phoneNumber);
  //     expect(mockCacheManager.del).toHaveBeenCalledWith(verifyCodeDto.phoneNumber);
  //     expect(service['userAuthStates'][verifyCodeDto.phoneNumber].isVerified).toBe(true);
  //   });
  // });

  // describe('checkExternalId', () => {
  //   it('should throw BadRequestException if externalId is empty', async () => {
  //     const externalId = '';
  //     expect(service.checkExternalId(externalId)).rejects.toThrow(BadRequestException);
  //   });

  //   it('should return undefined if loginId is available', async () => {
  //     const externalId = 'bookPang@naver.com';

  //     mockUsersRepository.findOne = jest.fn().mockResolvedValue(null);

  //     expect(service.checkExternalId(externalId)).resolves.toBeNull();
  //     expect(mockUsersRepository.findOne).toHaveBeenCalledWith({
  //       where: { externalId, deletedAt: null },
  //     });
  //     externalId;
  //   });

  //   it('should throw BadRequestException if externalId already exists', async () => {
  //     const externalId = 'example@gmail.com';

  //     expect(service.checkExternalId(externalId)).rejects.toThrow(BadRequestException);
  //     expect(mockUsersRepository.findOne).toHaveBeenCalledWith({
  //       where: { externalId, deletedAt: null },
  //     });
  //   });
  // });

  // describe('checkNickName', () => {
  //   it('should throw BadRequestException if nickname already exists', async () => {
  //     const nickname = '';

  //     expect(service.checkNickName(nickname)).rejects.toThrow(BadRequestException);
  //   });

  //   it('should throw BadRequestException if user already exists', async () => {
  //     const nickname = 'bookPang';

  //     mockUsersRepository.findOne = jest.fn().mockResolvedValue(dummyUserEntity);

  //     expect(service.checkNickName(nickname)).rejects.toThrow(BadRequestException);
  //     expect(mockUsersRepository.findOne).toHaveBeenCalled();
  //   });

  //   it('should return null if nickname does not exist', async () => {
  //     const nickname = 'bookPang';

  //     mockUsersRepository.findOne = jest.fn().mockResolvedValue(null);

  //     expect(service.checkNickName(nickname)).resolves.toBeNull();
  //     expect(mockUsersRepository.findOne).toHaveBeenCalled();
  //   });
  // });

  // describe('userCreate', () => {
  //   it('should throw BadRequestException if createUserDto is empty', async () => {
  //     const createUserDto = {
  //       externalId: '',
  //       nickname: '',
  //       password: '',
  //       phoneNumber: '',
  //       termsOfService: {
  //         serviceTerms: true,
  //         privacyPolicy: true,
  //         carrierTerms: true,
  //         identificationInfoPolicy: true,
  //         verificationServiceTerms: true,
  //       },
  //     };

  //     expect(service.userCreate(createUserDto)).rejects.toThrow(BadRequestException);
  //   });

  //   it('should throw BadRequestException if createUserDto is empty', async () => {
  //     const createUserDto = {
  //       externalId: 'bookPang@bookpang.com',
  //       nickname: '',
  //       password: '',
  //       phoneNumber: '',
  //       termsOfService: {
  //         serviceTerms: true,
  //         privacyPolicy: true,
  //         carrierTerms: true,
  //         identificationInfoPolicy: true,
  //         verificationServiceTerms: true,
  //       },
  //     };

  //     expect(service.userCreate(createUserDto)).rejects.toThrow(BadRequestException);
  //   });

  //   it('should throw BadRequestException if createUserDto is empty', async () => {
  //     const createUserDto = {
  //       externalId: 'bookPang@bookpang.com',
  //       nickname: 'bookPang',
  //       password: '',
  //       phoneNumber: '',
  //       termsOfService: {
  //         serviceTerms: true,
  //         privacyPolicy: true,
  //         carrierTerms: true,
  //         identificationInfoPolicy: true,
  //         verificationServiceTerms: true,
  //       },
  //     };

  //     expect(service.userCreate(createUserDto)).rejects.toThrow(BadRequestException);
  //   });

  //   it('should throw BadRequestException if createUserDto is empty', async () => {
  //     const createUserDto = {
  //       externalId: 'bookPang@bookpang.com',
  //       nickname: 'bookPang',
  //       password: '',
  //       phoneNumber: '',
  //       termsOfService: {
  //         serviceTerms: true,
  //         privacyPolicy: true,
  //         carrierTerms: true,
  //         identificationInfoPolicy: true,
  //         verificationServiceTerms: true,
  //       },
  //     };
  //     service['userAuthStates'] = {
  //       [createUserDto.phoneNumber]: { isVerified: false },
  //     };

  //     expect(service.userCreate(createUserDto)).rejects.toThrow(BadRequestException);
  //   });

  //   it('should throw BadRequestException if userState is empty', async () => {
  //     const createUserDto = {
  //       externalId: 'bookPang@bookpang.com',
  //       nickname: 'bookPang',
  //       password: 'bookpang12345',
  //       phoneNumber: '01012345678',
  //       termsOfService: {
  //         serviceTerms: true,
  //         privacyPolicy: true,
  //         carrierTerms: true,
  //         identificationInfoPolicy: true,
  //         verificationServiceTerms: true,
  //       },
  //     };

  //     service['userAuthStates'] = {};

  //     expect(service.userCreate(createUserDto)).rejects.toThrow(BadRequestException);
  //   });

  //   it('should throw BadRequestException if password test is empty', async () => {
  //     const createUserDto = {
  //       externalId: 'bookPang@bookpang.com',
  //       nickname: 'bookPang',
  //       password: 'bookPang12345',
  //       phoneNumber: '01012345678',
  //       termsOfService: {
  //         serviceTerms: true,
  //         privacyPolicy: true,
  //         carrierTerms: true,
  //         identificationInfoPolicy: true,
  //         verificationServiceTerms: true,
  //       },
  //     };

  //     service['userAuthStates'] = {
  //       [createUserDto.phoneNumber]: { isVerified: false },
  //     };
  //     service['userAuthStates'][createUserDto.phoneNumber].isVerified = true;

  //     expect(service.userCreate(createUserDto)).rejects.toThrow(BadRequestException);
  //   });

  //   it('should successfully create a user if all data is valid and phone number is verified', async () => {
  //     const createUserDto = {
  //       externalId: 'bookPang@bookpang.com',
  //       nickname: 'bookPang',
  //       password: 'bookpang12345',
  //       phoneNumber: '01012345678',
  //       termsOfService: {
  //         serviceTerms: true,
  //         privacyPolicy: true,
  //         carrierTerms: true,
  //         identificationInfoPolicy: true,
  //         verificationServiceTerms: true,
  //       },
  //     };

  //     service['userAuthStates'] = {
  //       [createUserDto.phoneNumber]: { isVerified: false },
  //     };

  //     service['userAuthStates'][createUserDto.phoneNumber].isVerified = true;

  //     service.checkExternalId = jest.fn().mockResolvedValue(null);
  //     mockUsersRepository.save = jest.fn().mockResolvedValue(dummyUserEntity);
  //     mockTermsOfServiceService.saveTermsOfService = jest.fn().mockResolvedValue(undefined);

  //     const result = await service.userCreate(createUserDto);

  //     expect(result).toEqual(dummyUserEntity);
  //     expect(mockUsersRepository.save).toHaveBeenCalled();
  //   });
  // });

  // describe('login', () => {
  //   it('should throw BadRequestException if both externalId and password are empty', async () => {
  //     const logInDto = {
  //       externalId: '',
  //       password: '',
  //     };

  //     expect(service.logIn(logInDto)).rejects.toThrow(BadRequestException);
  //   });

  //   it('should throw BadRequestException if password is empty', async () => {
  //     const logInDto = {
  //       externalId: 'bookpang@bookpang.com',
  //       password: '',
  //     };

  //     expect(service.logIn(logInDto)).rejects.toThrow(BadRequestException);
  //   });

  //   it('should throw BadRequestException if externalId is empty', async () => {
  //     const logInDto = {
  //       externalId: '',
  //       password: 'bookpang12345',
  //     };

  //     expect(service.logIn(logInDto)).rejects.toThrow(BadRequestException);
  //   });

  //   it('should throw BadRequestException if externalId does not exist', async () => {
  //     const logInDto = {
  //       externalId: 'bookPang@naver.com',
  //       password: 'bookpang12345',
  //     };

  //     mockUsersRepository.findOne = jest.fn().mockResolvedValue(null);
  //     expect(service.logIn(logInDto)).rejects.toThrow(BadRequestException);
  //   });

  //   it('should throw UnauthorizedException if password is invalid', async () => {
  //     const logInDto = {
  //       externalId: 'bookPang@naver.com',
  //       password: 'bookpang12345',
  //     };

  //     mockUsersRepository.findOne = jest.fn().mockResolvedValue(dummyUserEntity);
  //     (bcrypt.compare as jest.Mock) = jest.fn().mockResolvedValue(false);

  //     expect(service.logIn(logInDto)).rejects.toThrow(UnauthorizedException);
  //   });

  //   it('should return access and refresh tokens when login is successful', async () => {
  //     const logInDto: LogInDto = {
  //       externalId: 'validExternalId',
  //       password: 'validPassword',
  //     };

  //     const hashedPassword = await bcrypt.hash(logInDto.password, AUTH_CONSTANT.HASH_SALT_ROUNDS);

  //     const dummyUser = {
  //       id: 1,
  //       externalId: logInDto.externalId,
  //       password: hashedPassword,
  //       deletedAt: null,
  //     };

  //     mockUsersRepository.findOne = jest.fn().mockResolvedValue(dummyUser);
  //     (bcrypt.compare as jest.Mock) = jest.fn().mockResolvedValue(true);

  //     jest.spyOn(mockJwtService, 'sign')
  //     .mockReturnValueOnce('mockedAccessToken') 
  //     .mockReturnValueOnce('mockedRefreshToken');
  
  //     mockRefreshTokensService.findRefreshToken = jest.fn().mockResolvedValue(undefined);

  //     const result = await service.logIn(logInDto);

  //     expect(result).toEqual({
  //       accessToken: 'mockedAccessToken',
  //       refreshToken: 'mockedRefreshToken',
  //     });
  //   });
  // });

  // describe('refreshToken', () => {
  //   it('should throw NotFoundException if user is not Found', async () => {
  //     const userId = 1;
  //     const refreshToken = 'dummeyToekn';
  //     mockRefreshTokensService.findUserRefreshToken = jest.fn().mockResolvedValue(null);

  //     expect(service.refreshToken(userId, refreshToken)).rejects.toThrow(NotFoundException);
  //   });

  //   it('should throw NotFoundException if user.refreshToken is not Found', async () => {
  //     const userId = 1;
  //     const refreshToken = 'dummeyToekn';
  //     const dummyUserToken = {
  //       id: 1,
  //       userId: 1,
  //       refreshToken: null,
  //       createdAt: new Date(),
  //       updatedAt: new Date(),
  //     };
  //     mockRefreshTokensService.findUserRefreshToken = jest.fn().mockResolvedValue(dummyUserToken);

  //     expect(service.refreshToken(userId, refreshToken)).rejects.toThrow(NotFoundException);
  //   });

  //   it('should throw NotFoundException if refreshToken does not match stored refreshToken', async () => {
  //     const userId = 1;
  //     const refreshToken = 'invalidToken';
  //     const dummyUserToken = {
  //       id: 1,
  //       userId: 1,
  //       refreshToken: 'hashedValidToken',
  //       createdAt: new Date(),
  //       updatedAt: new Date(),
  //     };

  //     mockRefreshTokensService.findUserRefreshToken = jest.fn().mockResolvedValue(dummyUserToken);
  //     (bcrypt.compare as jest.Mock) = jest.fn().mockResolvedValue(false);

  //     expect(service.refreshToken(userId, refreshToken)).rejects.toThrow(NotFoundException);
  //   });

  //   it('should return a new access token when refresh token is valid', async () => {
  //     const userId = 1;
  //     const refreshToken = 'validToken';
  //     const hashedToken = await bcrypt.hash(refreshToken, AUTH_CONSTANT.HASH_SALT_ROUNDS);

  //     const dummyUserToken = {
  //       id: 1,
  //       userId: 1,
  //       refreshToken: hashedToken,
  //       createdAt: new Date(),
  //       updatedAt: new Date(),
  //     };

  //     mockRefreshTokensService.findUserRefreshToken = jest.fn().mockResolvedValue(dummyUserToken);
  //     (bcrypt.compare as jest.Mock) = jest.fn().mockResolvedValue(true);
  //     mockJwtService.sign = jest.fn().mockReturnValue('newAccessToken');

  //     const result = await service.refreshToken(userId, refreshToken);

  //     expect(result).toEqual({ accessToken: 'newAccessToken' });
  //   });
  // });

  describe('checkUserForAuth', () => {
    it('should successfully checkUserForAuth is verified', async () => {
      const id = 1;
      mockUsersRepository.findOne = jest.fn().mockResolvedValue(dummyUserEntity);

      expect(service.checkUserForAuth({ id })).resolves.toEqual(dummyUserEntity);
    });
  });
});
