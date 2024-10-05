import * as bcrypt from "bcrypt";
import { Injectable, BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { CreateAuthDto } from "./dto/create-auth.dto";
import { RedisConfig } from "../../database/redis/redis.config";
import { InjectRepository } from "@nestjs/typeorm";
import { UsersEntity } from "../../entities/users.entity";
import { Repository } from "typeorm";
import { AUTH_CONSTANT } from "../../constants/auth.constant";
import { Auth } from "@vonage/auth";
import { Vonage } from "@vonage/server-sdk";
import { LogInDto } from "./dto/log-in.dto";
import { JwtService } from "@nestjs/jwt";
import { RefreshTokensEntity } from "../../entities/refresh-tokens.entity";

@Injectable()
export class AuthService {
  private readonly vonage: Vonage;
  private readonly MIN_VERIFICATION_CODE = 100000;
  private readonly MAX_VERIFICATION_CODE = 999999;

  constructor(
    @InjectRepository(UsersEntity)
    private readonly userRepository: Repository<UsersEntity>,
    private readonly configService: ConfigService,
    private readonly redisConfig: RedisConfig,
    private readonly jwtService: JwtService,
    @InjectRepository(RefreshTokensEntity)
    private readonly refreshTokenRepository: Repository<RefreshTokensEntity>,
  ) {
    const credentials = new Auth({
      apiKey: this.configService.get<string>("VONAGE_API_KEY"),
      apiSecret: this.configService.get<string>("VONAGE_API_SECRET"),
    });
    this.vonage = new Vonage(credentials);
  }

  async sendVerificationCode(phoneNumber: string) {
    const verificationCode = this.generateVerificationCode();
    const formattedPhoneNumber = this.formatPhoneNumber(phoneNumber);

    await this.redisConfig.saveVerificationCode(formattedPhoneNumber, verificationCode);

    const from = this.configService.get<string>("VONAGE_SENDER_NUMBER");
    const text = `Your verification code is ${verificationCode}`;
    await this.vonage.sms.send({
      to: formattedPhoneNumber,
      from,
      text,
    });
  }

  async phoneNumberValidator(phoneNumber: string, verificationCode: number) {
    const phoneNumberForm = this.formatPhoneNumber(phoneNumber);
    const userCode = await this.redisConfig.getVerificationCode(phoneNumberForm);

    if (+userCode !== verificationCode) {
      throw new BadRequestException("인증코드가 일치하지 않습니다.");
    }
    await this.redisConfig.deleteVerificationCode(phoneNumberForm);
  }

  async checkLoginIdAvailability(loginId: string) {
    const user = await this.userRepository.findOne({ where: { loginId } });
    if (user) {
      throw new BadRequestException("사용중인 아이디입니다.");
    }
  }

  async userCreate(createAuthDto: CreateAuthDto) {
    const { loginId, nickname, password, phoneNumber } = createAuthDto;

    await this.checkLoginIdAvailability(loginId);

    const hashPassword = await bcrypt.hash(password, AUTH_CONSTANT.HASH_SALT_ROUNDS);

    await this.userRepository.save({
      loginId,
      nickname,
      password: hashPassword,
      phoneNumber,
    });
    return { message: "회원가입 성공하였습니다." };
  }

  // 인증코드 생성 함수
  private generateVerificationCode(): number {
    return Math.floor(
      this.MIN_VERIFICATION_CODE +
        Math.random() * (this.MAX_VERIFICATION_CODE - this.MIN_VERIFICATION_CODE),
    );
  }

  // 전화번호 형식 변환 함수
  private formatPhoneNumber(phoneNumber: string) {
    return `+82${phoneNumber.substring(1)}`;
  }

  async logIn(logInDto: LogInDto) {
    const { loginId, password } = logInDto;
    const user = await this.userRepository.findOne({ where: { loginId: loginId } });

    if (!user) {
      throw new BadRequestException("아이디를 찾을 수 없습니다.");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new BadRequestException("잘못된 비밀번호입니다.");
    }

    const payload = { loginId: loginId, userId: user.id };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>("JWT_ACCESS_TOKEN_EXPIRATION"),
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>("JWT_REFRESH_TOKEN_EXPIRATION"),
    });

    await this.refreshTokenRepository.upsert(
      {
        userId: payload.userId,
        refreshToken: refreshToken,
      },
      {
        conflictPaths: ['userId'],
        skipUpdateIfNoValuesChanged: true,
      }
    );
    
    return { accessToken, refreshToken };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const storedRefreshToken = await this.refreshTokenRepository.findOne({
        where: { refreshToken: refreshToken },
      });

      if (!storedRefreshToken || storedRefreshToken.refreshToken !== refreshToken) {
        throw new BadRequestException("유효하지 않은 리프레시 토큰입니다.");
      }

      const newAccessToken = this.jwtService.sign(
        { loginId: payload.loginId, userId: payload.userId },
        { expiresIn: "60m" },
      );

      return { accessToken: newAccessToken };
    } catch (e) {
      throw new BadRequestException("유효하지 않은 리프레시 토큰입니다.");
    }
  }

  async logout(userId) {
    await this.refreshTokenRepository.delete({ userId: userId });
  }
}
