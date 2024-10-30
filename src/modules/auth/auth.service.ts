import {
  Injectable,
  BadRequestException,
  Inject,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import * as bcrypt from 'bcrypt';
import { Vonage } from '@vonage/server-sdk';
import { Repository } from 'typeorm';
import { Cache } from 'cache-manager';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { AUTH_CONSTANT } from '../../common/auth.constant';
import { UsersEntity } from '../../entities/users.entity';
import { RefreshTokenService } from '../refresh-token/refresh-token.service';
import { LogInDto } from './dto/log-in.dto';
import { PhoneDto } from './dto/phone-number-dto';
import { TermsOfServiceService } from '../terms-of-service/terms-of-service.service';

@Injectable()
export class AuthService {
  private userAuthStates: {}
  constructor(
    @InjectRepository(UsersEntity)
    private userRepository: Repository<UsersEntity>,
    @Inject(CACHE_MANAGER) 
    private cacheManager: Cache,
    private refreshTokenService: RefreshTokenService,
    private termsOfServiceService: TermsOfServiceService,
    private configService: ConfigService,
    private jwtService: JwtService,
    private vonage: Vonage,
  ) {}

  public async sendVerificationCode(phoneDto: PhoneDto) {
    const { phoneNumber } = phoneDto;

    if (!phoneNumber) {
      throw new NotFoundException('phoneNumber 값을 확인해 주세요.');
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000);
    const formattedPhoneNumber = this.formatPhoneNumber(phoneNumber);
    await this.cacheManager.set(phoneNumber, verificationCode, 300000);

    this.userAuthStates[phoneNumber] = { isVerified: false };
    this.vonage.sms.send({
      to: formattedPhoneNumber,
      from: this.configService.get<string>('VONAGE_SENDER_NUMBER'),
      text: `Your bookPang verification code is ${verificationCode}`,
    });
  }

  public async phoneNumberValidator(verifyCodeDto: VerifyCodeDto) {
    const { phoneNumber, verificationCode } = verifyCodeDto;

    if (!phoneNumber || !verificationCode) {
      throw new BadRequestException('phoneNumber, verificationCode 값을 확인해 주세요.');
    }

    const cacheKey = await this.cacheManager.get(phoneNumber);
    if (cacheKey !== verificationCode) {
      throw new BadRequestException('인증코드가 일치하지 않습니다.');
    }
    this.userAuthStates[phoneNumber].isVerified = true;
    await this.cacheManager.del(phoneNumber);
  }

  public async checkExternalId(externalId: string) {
    if (!externalId) {
      throw new BadRequestException('externalId 값을 확인해 주세요.');
    }

    const user = await this.userRepository.findOne({
      where: { externalId, deletedAt: null },
    });

    if (user) {
      throw new BadRequestException('사용중인 아이디입니다.');
    }
    return null;
  }

  public async checkNickName(nickname: string) {
    if (!nickname) {
      throw new BadRequestException('nickname 값을 확인해 주세요.');
    }

    const user = await this.userRepository.findOne({
      where: { nickname, deletedAt: null },
    });

    if (user) {
      throw new BadRequestException('사용중인 닉네임입니다.');
    }
    return null;
  }

  public async userCreate(createUserDto: CreateUserDto) {
    const { externalId, nickname, password, phoneNumber } = createUserDto;
    if (!externalId || !nickname || !password || !phoneNumber) {
      throw new BadRequestException(
        'loginId, nickname, password, phoneNumber 값들을 확인해 주세요.',
      );
    }

    const userState = this.userAuthStates[phoneNumber];
    if (!userState || !userState.isVerified) {
      throw new BadRequestException("이메일 인증이 필요합니다.");
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*\d)[a-z\d]{8,15}$/;
    if (!passwordRegex.test(password)) {
      throw new BadRequestException(
        '비밀번호는 8~15자 이내의 영문 소문자와 숫자가 혼합되어야 합니다.',
      );
    }

    await this.checkExternalId(externalId);

    const hashPassword = bcrypt.hashSync(password, AUTH_CONSTANT.HASH_SALT_ROUNDS);

    const userCreateData = await this.userRepository.save({
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
      verificationServiceTerms: createUserDto.termsOfService.verificationServiceTerms
    })
    delete this.userAuthStates[phoneNumber];

    return userCreateData
  }

  public async logIn(logInDto: LogInDto) {
    const { externalId, password } = logInDto;
    if (!externalId || !password) {
      throw new BadRequestException('loginId, password 값을 확인해 주세요.');
    }

    const user = await this.userRepository.findOne({
      where: { externalId: externalId, deletedAt: null },
    });

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
    await this.refreshTokenService.findRefreshToken(user.id, hashRefreshToken)

    return { accessToken, refreshToken };
  }

  public async refreshToken(userId: number, refreshToken: string) {
    const user = await this.refreshTokenService.findUserRefreshToken(userId)
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

  public async checkUserForAuth({ id }) {
    return this.userRepository.findOne({ where: { id } });
  }

  // 전화번호 형식 변환 함수
  private formatPhoneNumber(phoneNumber: string) {
    if (phoneNumber.length !== 11 || !/^(010)\d{8}$/.test(phoneNumber)) {
      throw new BadRequestException('phoneNumber 값을 다시 확인해 주세요.');
    }
    return `+82${phoneNumber.substring(1)}`;
  }
}
