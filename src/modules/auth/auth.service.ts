import * as bcrypt from 'bcrypt';
import {
  Injectable,
  BadRequestException,
  Inject,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersEntity } from '../../entities/users.entity';
import { AUTH_CONSTANT } from '../../common/auth.constant';
import { Vonage } from '@vonage/server-sdk';
import { LogInDto } from './dto/log-in.dto';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokensEntity } from '../../entities/refresh-tokens.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class AuthService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectRepository(UsersEntity)
    private userRepository: Repository<UsersEntity>,
    @InjectRepository(RefreshTokensEntity)
    private refreshTokenRepository: Repository<RefreshTokensEntity>,
    private configService: ConfigService,
    private jwtService: JwtService,
    private vonage: Vonage,
  ) {}

  public async sendVerificationCode(phoneNumber: string) {
    if (!phoneNumber) {
      throw new NotFoundException('phoneNumber 값을 확인해 주세요.');
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000);
    const formattedPhoneNumber = this.formatPhoneNumber(phoneNumber);
    await this.cacheManager.set(phoneNumber, verificationCode, 300000);

    this.vonage.sms.send({
      to: formattedPhoneNumber,
      from: this.configService.get<string>('VONAGE_SENDER_NUMBER'),
      text: `Your verification code is ${verificationCode}`,
    });
  }

  public async phoneNumberValidator(phoneNumber: string, verificationCode: number) {
    if (!phoneNumber || !verificationCode) {
      throw new BadRequestException('phoneNumber, verificationCode 값을 확인해 주세요.');
    }

    const cacheKey = await this.cacheManager.get(phoneNumber);
    if (cacheKey !== verificationCode) {
      throw new BadRequestException('인증코드가 일치하지 않습니다.');
    }
    await this.cacheManager.del(phoneNumber);
  }

  public async checkLoginIdAvailability(loginId: string) {
    if (!loginId) {
      throw new BadRequestException('loginId 값을 확인해 주세요.');
    }

    const user = await this.userRepository.findOne({
      where: { loginId, deletedAt: null },
    });
    console.log(user)
    if (user) {
      throw new BadRequestException('사용중인 아이디입니다.');
    }
    return null;
  }

  public async userCreate(createUserDto: CreateUserDto) {
    const { loginId, nickname, password, phoneNumber } = createUserDto;
    if (!loginId || !nickname || !password || !phoneNumber) {
      throw new BadRequestException(
        'loginId, nickname, password, phoneNumber 값들을 확인해 주세요.',
      );
    }
    await this.checkLoginIdAvailability(loginId);

    const hashPassword = bcrypt.hashSync(password, AUTH_CONSTANT.HASH_SALT_ROUNDS);

    return this.userRepository.save({
      loginId,
      nickname,
      password: hashPassword,
      phoneNumber,
    });
  }

  public async logIn(logInDto: LogInDto) {
    const { loginId, password } = logInDto;
    if (!loginId || !password) {
      throw new BadRequestException('loginId, password 값을 확인해 주세요.');
    }

    const user = await this.userRepository.findOne({
      where: { loginId: loginId, deletedAt: null },
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
    await this.refreshTokenRepository.upsert(
      {
        userId: user.id,
        refreshToken: hashRefreshToken,
      },
      {
        conflictPaths: ['userId'],
        skipUpdateIfNoValuesChanged: true,
      },
    );

    return { accessToken, refreshToken };
  }

  public async refreshToken(userId: number, refreshToken: string) {
    const user = await this.refreshTokenRepository.findOne({ where: { userId } });
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
