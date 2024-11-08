import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AccountModuleService } from './account-module.service';
import { RefreshTokenService } from '../../modules/refresh-token/refresh-token.service';
import { TermsOfServiceService } from '../../modules/terms-of-service/terms-of-service.service';
import { AuthService } from '../../modules/auth/auth.service';
import { BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UsersEntity } from '../../modules/auth/entities/users.entity';
import { TermsOfServiceEntity } from '../../modules/terms-of-service/entities/terms_of_service.entity';
import { LogInDto } from '../../modules/auth/dto/log-in.dto';
import { AUTH_CONSTANT } from '../../common/auth.constant';
import { RefreshTokensEntity } from '../../modules/refresh-token/entities/refresh-tokens.entity';
import bcrypt from 'bcrypt';

const dummyUserData = {
  externalId: 'bookPang@bookpang.com',
  nickname: 'bookpang1234',
  password: '$2b$10$owOYi78x/7h5w28OWMKAAuCgNH6GEFkQL53l.UX0eXXTymyh8okCW',
  phoneNumber: '010111111111',
  address: null,
  id: 1,
  provider: 'LOCAL',
  createdAt: new Date(),
  updatedAt: null,
  deletedAt: null,
} as UsersEntity;

const dummyTermsOfServiceData = {
  userId: 1,
  serviceTerms: true,
  privacyPolicy: true,
  carrierTerms: true,
  identificationInfoPolicy: true,
  verificationServiceTerms: true,
  id: 2,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
} as TermsOfServiceEntity;

describe('AccountModuleService', () => {
  let service: AccountModuleService;
  let mockRefreshTokenService: jest.Mocked<RefreshTokenService>;
  let mockTermsOfServiceService: jest.Mocked<TermsOfServiceService>;
  let mockAuthService: jest.Mocked<AuthService>;
  let mockConfigService: jest.Mocked<ConfigService>;
  let mockJwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    mockRefreshTokenService = {
      findRefreshToken: jest.fn(),
      findUserRefreshToken: jest.fn(),
    } as unknown as jest.Mocked<RefreshTokenService>;

    mockTermsOfServiceService = {
      saveTermsOfService: jest.fn(),
    } as unknown as jest.Mocked<TermsOfServiceService>;

    mockAuthService = {
      userAuthStates: jest.fn(),
      checkExternalId: jest.fn(),
      findUserPhoneNumber: jest.fn(),
      userCreate: jest.fn(),
      findOneUser: jest.fn(),
    } as unknown as jest.Mocked<AuthService>;

    mockConfigService = {
      get: jest.fn(),
    } as unknown as jest.Mocked<ConfigService>;

    mockJwtService = {
      sign: jest.fn(),
    } as unknown as jest.Mocked<JwtService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountModuleService,
        {
          provide: RefreshTokenService,
          useValue: mockRefreshTokenService,
        },
        {
          provide: TermsOfServiceService,
          useValue: mockTermsOfServiceService,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
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

    service = module.get<AccountModuleService>(AccountModuleService);
  });

  describe('userCreate', () => {
    it('should throw BadRequestException if createUserDto has empty fields', async () => {
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
          verificationServiceTerms: true,
        },
      };

      expect(service.userCreate(createUserDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if nickname is missing', async () => {
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
          verificationServiceTerms: true,
        },
      };

      expect(service.userCreate(createUserDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if password is missing', async () => {
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
          verificationServiceTerms: true,
        },
      };

      expect(service.userCreate(createUserDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if phone number is not verified', async () => {
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
          verificationServiceTerms: true,
        },
      };
      mockAuthService.userAuthStates = {
        [createUserDto.phoneNumber]: { isVerified: false },
      };

      expect(service.userCreate(createUserDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if password format is invalid', async () => {
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
          verificationServiceTerms: true,
        },
      };
      mockAuthService.checkExternalId.mockResolvedValue(null);
      mockAuthService.userAuthStates = {
        [createUserDto.phoneNumber]: { isVerified: false },
      };

      expect(service.userCreate(createUserDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if duplicate phone number is found', async () => {
      const createUserDto = {
        externalId: 'example@bookpang.com',
        nickname: 'bookPang',
        password: 'Invalid',
        phoneNumber: '01012345678',
        termsOfService: {
          serviceTerms: true,
          privacyPolicy: true,
          carrierTerms: true,
          identificationInfoPolicy: true,
          verificationServiceTerms: true,
        },
      };

      mockAuthService.checkExternalId.mockResolvedValue(null);
      mockAuthService.findUserPhoneNumber.mockResolvedValue(null);
      mockAuthService.userAuthStates = {
        [createUserDto.phoneNumber]: { isVerified: true },
      };
      expect(service.userCreate(createUserDto)).rejects.toThrow(BadRequestException);
    });

    it('should create a user successfully if all data is valid and phone number is verified', async () => {
      const createUserDto = {
        externalId: 'example@bookpang.com',
        nickname: 'bookPang',
        password: 'bookpang1234',
        phoneNumber: '01012345678',
        termsOfService: {
          serviceTerms: true,
          privacyPolicy: true,
          carrierTerms: true,
          identificationInfoPolicy: true,
          verificationServiceTerms: true,
        },
      };

      mockAuthService.checkExternalId.mockResolvedValue(null);
      mockAuthService.userAuthStates = {
        [createUserDto.phoneNumber]: { isVerified: true },
      };
      mockAuthService.findUserPhoneNumber.mockResolvedValue(dummyUserData);

      await expect(service.userCreate(createUserDto)).rejects.toThrow(BadRequestException);
    });

    it('should successfully create a user if all data is valid and phone number is verified', async () => {
      const createUserDto = {
        externalId: 'bookPang@bookpang.com',
        nickname: 'bookpang1234',
        password: 'bookpang12345',
        phoneNumber: '01012345678',
        termsOfService: {
          serviceTerms: true,
          privacyPolicy: true,
          carrierTerms: true,
          identificationInfoPolicy: true,
          verificationServiceTerms: true,
        },
      };

      mockAuthService.checkExternalId.mockResolvedValue(null);
      mockAuthService.findUserPhoneNumber.mockResolvedValue(null);
      mockAuthService.userAuthStates = {
        [createUserDto.phoneNumber]: { isVerified: true },
      };
      mockAuthService.userCreate.mockResolvedValue(dummyUserData);
      mockTermsOfServiceService.saveTermsOfService.mockResolvedValue(dummyTermsOfServiceData);

      await service.userCreate(createUserDto);

      expect(mockAuthService.checkExternalId).toHaveBeenCalled();
      expect(mockAuthService.findUserPhoneNumber).toHaveBeenCalled();
      expect(mockAuthService.userCreate).toHaveBeenCalled();
      expect(mockTermsOfServiceService.saveTermsOfService).toHaveBeenCalled();
    });
  });

  describe('logIn', () => {
    it('should throw BadRequestException if externalId and password are empty', async () => {
      const logInDto = {
        externalId: '',
        password: '',
      } as LogInDto;

      await expect(service.logIn(logInDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if password are empt', async () => {
      const logInDto = {
        externalId: 'bookPang@bookpang.com',
        password: '',
      } as LogInDto;

      await expect(service.logIn(logInDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if externalId is not found', async () => {
      const logInDto = {
        externalId: 'bookPang@bookpang.com',
        password: 'bookpang12345',
      } as LogInDto;

      mockAuthService.findOneUser.mockResolvedValue(null);
      await expect(service.logIn(logInDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if password is incorrect', async () => {
      const logInDto = {
        externalId: 'bookPang@bookpang.com',
        password: 'bookpang12345',
      } as LogInDto;

      mockAuthService.findOneUser.mockResolvedValue(dummyUserData);
      (bcrypt.compare as jest.Mock) = jest.fn().mockResolvedValue(false);

      await expect(service.logIn(logInDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should return access and refresh tokens when login is successful', async () => {
      const logInDto: LogInDto = {
        externalId: 'validExternalId',
        password: 'validPassword',
      };

      const hashedPassword = await bcrypt.hash(logInDto.password, AUTH_CONSTANT.HASH_SALT_ROUNDS);

      const dummyUser = {
        id: 1,
        externalId: logInDto.externalId,
        password: hashedPassword,
        deletedAt: null,
      };

      // mockUsersRepository.findOne = jest.fn().mockResolvedValue(dummyUser);
      mockAuthService.findOneUser.mockResolvedValue(dummyUserData);
      (bcrypt.compare as jest.Mock) = jest.fn().mockResolvedValue(true);

      jest
        .spyOn(mockJwtService, 'sign')
        .mockReturnValueOnce('mockedAccessToken')
        .mockReturnValueOnce('mockedRefreshToken');

      mockRefreshTokenService.findRefreshToken.mockResolvedValue(undefined);

      const result = await service.logIn(logInDto);

      expect(result).toEqual({
        accessToken: 'mockedAccessToken',
        refreshToken: 'mockedRefreshToken',
      });
    });
  });

  describe('refreshToken', () => {
    it('should throw NotFoundException if user is not Found', async () => {
      const userId = 1;
      const refreshToken = 'dummeyToekn';
      mockRefreshTokenService.findUserRefreshToken.mockResolvedValue(null);

      expect(service.refreshToken(userId, refreshToken)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if user.refreshToken is not Found', async () => {
      const userId = 1;
      const refreshToken = 'dummeyToekn';
      const dummyUserToken = {
        id: 1,
        userId: 1,
        refreshToken: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as RefreshTokensEntity;
      mockRefreshTokenService.findUserRefreshToken.mockResolvedValue(dummyUserToken);

      expect(service.refreshToken(userId, refreshToken)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if refreshToken does not match stored refreshToken', async () => {
      const userId = 1;
      const refreshToken = 'invalidToken';
      const dummyUserToken = {
        id: 1,
        userId: 1,
        refreshToken: 'hashedValidToken',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as RefreshTokensEntity;

      mockRefreshTokenService.findUserRefreshToken.mockResolvedValue(dummyUserToken);
      (bcrypt.compare as jest.Mock) = jest.fn().mockResolvedValue(false);

      expect(service.refreshToken(userId, refreshToken)).rejects.toThrow(NotFoundException);
    });

    it('should return a new access token when refresh token is valid', async () => {
      const userId = 1;
      const refreshToken = 'validToken';
      const hashedToken = await bcrypt.hash(refreshToken, AUTH_CONSTANT.HASH_SALT_ROUNDS);

      const dummyUserToken = {
        id: 1,
        userId: 1,
        refreshToken: hashedToken,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as RefreshTokensEntity;

      mockRefreshTokenService.findUserRefreshToken.mockResolvedValue(dummyUserToken);
      (bcrypt.compare as jest.Mock) = jest.fn().mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('newAccessToken');

      const result = await service.refreshToken(userId, refreshToken);

      expect(result).toEqual({ accessToken: 'newAccessToken' });
    });
  });
});
