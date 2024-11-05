import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { RefreshTokenService } from '../../modules/refresh-token/refresh-token.service';
import { TermsOfServiceService } from '../../modules/terms-of-service/terms-of-service.service';
import { CreateUserDto } from '../../modules/auth/dto/create-user.dto';
import { AuthService } from '../../modules/auth/auth.service';
import { AUTH_CONSTANT } from '../../common/auth.constant';
import { LogInDto } from '../../modules/auth/dto/log-in.dto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AccountModuleService {
  constructor(
    private refreshTokenService: RefreshTokenService,
    private termsOfServiceService: TermsOfServiceService,
    private authService: AuthService,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  public async userCreate(createUserDto: CreateUserDto) {
    const { externalId, nickname, password, phoneNumber } = createUserDto;
    if (!externalId || !nickname || !password || !phoneNumber) {
      throw new BadRequestException(
        'externalId, nickname, password, phoneNumber 값들을 확인해 주세요.',
      );
    }
    await this.authService.checkExternalId(externalId);

    const userState = this.authService.userAuthStates[phoneNumber];
    if (!userState || !userState.isVerified) {
      throw new BadRequestException('이메일 인증이 필요합니다.');
    }
    
    delete this.authService.userAuthStates[phoneNumber];

    const userPhoneNumber = await this.authService.findUserPhoneNumber(phoneNumber)
    if(userPhoneNumber){
      throw new BadRequestException('이미 가입된 유저입니다.')
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*\d)[a-z\d]{8,15}$/;
    if (!passwordRegex.test(password)) {
      throw new BadRequestException(
        '비밀번호는 8~15자 이내의 영문 소문자와 숫자가 혼합되어야 합니다.',
      );
    }

    const hashPassword = bcrypt.hashSync(password, AUTH_CONSTANT.HASH_SALT_ROUNDS);

    const userCreateData = await this.authService.userCreate({
      externalId,
      nickname,
      password: hashPassword,
      phoneNumber,
    });

    await this.termsOfServiceService.saveTermsOfService({
      userId: userCreateData.id,
      serviceTerms: createUserDto.termsOfService.serviceTerms,
      privacyPolicy: createUserDto.termsOfService.privacyPolicy,
      carrierTerms: createUserDto.termsOfService.carrierTerms,
      identificationInfoPolicy: createUserDto.termsOfService.identificationInfoPolicy,
      verificationServiceTerms: createUserDto.termsOfService.verificationServiceTerms,
    });
  }

  public async logIn(logInDto: LogInDto) {
    const { externalId, password } = logInDto;
    if (!externalId || !password) {
      throw new BadRequestException('loginId, password 값을 확인해 주세요.');
    }

    const user = await this.authService.findOneUser(externalId)
    if (!user) {
      throw new BadRequestException('아이디를 찾을 수 없습니다.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('잘못된 비밀번호입니다.');
    }

    const payload = { userId: user.id };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRATION'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRATION'),
    });

    const hashRefreshToken = await bcrypt.hash(refreshToken, AUTH_CONSTANT.HASH_SALT_ROUNDS);
    await this.refreshTokenService.findRefreshToken(user.id, hashRefreshToken);

    return { accessToken, refreshToken };
  }

  public async refreshToken(userId: number, refreshToken: string) {
    const user = await this.refreshTokenService.findUserRefreshToken(userId);
    if (!user) {
      throw new NotFoundException('유저를 찾을 수 없습니다.');
    }

    if (!user.refreshToken) {
      throw new NotFoundException('저장된 리프레시 토큰이 없습니다.');
    }
    const userToken = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!userToken) {
      throw new NotFoundException('인증 정보가 유효하지 않습니다.');
    }
    const payload = { userId: user.id };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRATION'),
    });

    return { accessToken };
  }
}
