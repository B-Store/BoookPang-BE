import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AccountModuleService } from './account-module.service';
import { RefreshTokenService } from '../../modules/refresh-token/refresh-token.service';
import { TermsOfServiceService } from '../../modules/terms-of-service/terms-of-service.service';
import { AuthService } from '../../modules/auth/auth.service';

describe('AccountModuleService', () => {
  let service: AccountModuleService;
  let mockRefreshTokenService: jest.Mocked<RefreshTokenService>;
  let mockTermsOfServiceService: jest.Mocked<TermsOfServiceService>;
  let mockAuthService: jest.Mocked<AuthService>;
  let mockConfigService: jest.Mocked<ConfigService>;
  let mockJwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    mockRefreshTokenService = {} as unknown as jest.Mocked<RefreshTokenService>;
    mockTermsOfServiceService = {} as unknown as jest.Mocked<TermsOfServiceService>;
    mockAuthService = {} as unknown as jest.Mocked<AuthService>;
    mockConfigService = {} as unknown as jest.Mocked<ConfigService>;
    mockJwtService = {} as unknown as jest.Mocked<JwtService>;

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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
