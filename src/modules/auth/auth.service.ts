import * as bcrypt from "bcrypt";
import { Injectable, BadRequestException, Inject, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Repository } from "typeorm";
import { CreateUserDto } from "./dto/create-user.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { UsersEntity } from "../../entities/users.entity";
import { AUTH_CONSTANT } from "../../constants/auth.constant";
import { Vonage } from "@vonage/server-sdk";
import { LogInDto } from "./dto/log-in.dto";
import { JwtService } from "@nestjs/jwt";
import { RefreshTokensEntity } from "../../entities/refresh-tokens.entity";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";

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

  async sendVerificationCode(phoneNumber: string) {
    const verificationCode = Math.floor(100000 + Math.random() * 900000);
    
    const formattedPhoneNumber = this.formatPhoneNumber(phoneNumber);

    await this.cacheManager.set(phoneNumber, verificationCode, 300000);

    const from = this.configService.get<string>("VONAGE_SENDER_NUMBER");
    const text = `Your verification code is ${verificationCode}`;
    await this.vonage.sms.send({
      to: formattedPhoneNumber,
      from,
      text,
    });
  }

  public async phoneNumberValidator(phoneNumber: string, verificationCode: number) {
    const phoneNumberForm = this.formatPhoneNumber(phoneNumber);
    const cacheKey = await this.cacheManager.get(phoneNumber);
    if (cacheKey !== verificationCode) {
      throw new BadRequestException("인증코드가 일치하지 않습니다.");
    }
    await this.cacheManager.del(phoneNumberForm);
  }

  public async checkLoginIdAvailability(loginId: string) {
    const user = await this.userRepository.findOne({
      where: { loginId, deletedAt: null },
    });

    if (user) {
      throw new BadRequestException("사용중인 아이디입니다.");
    }
  }

  public async userCreate(createUserDto: CreateUserDto) {
    const { loginId, nickname, password, phoneNumber } = createUserDto;

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

  public async logIn(logInDto: LogInDto) {
    const { loginId, password } = logInDto;
    const user = await this.userRepository.findOne({ where: { loginId: loginId } });

    if (!user) {
      throw new BadRequestException("아이디를 찾을 수 없습니다.");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new BadRequestException("잘못된 비밀번호입니다.");
    }

    const payload = { userId: user.id };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>("ACCESS_TOKEN_SECRET"),
      expiresIn: this.configService.get<string>("JWT_ACCESS_TOKEN_EXPIRATION"),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>("REFRESH_TOKEN_SECRET"),
      expiresIn: this.configService.get<string>("JWT_REFRESH_TOKEN_EXPIRATION"),
    });

    const hashRefreshToken = await bcrypt.hash(refreshToken, AUTH_CONSTANT.HASH_SALT_ROUNDS);
    await this.refreshTokenRepository.upsert(
      {
        userId: user.id,
        refreshToken: hashRefreshToken,
      },
      {
        conflictPaths: ["userId"],
        skipUpdateIfNoValuesChanged: true,
      },
    );

    return { accessToken, refreshToken };
  }

  public async refreshToken(userId: number, refreshToken: string) {
    const user = await this.refreshTokenRepository.findOne({ where: { userId } });
    if (!user) {
      throw new NotFoundException("유저를 찾을 수 없습니다.");
    }

    if (!user.refreshToken) {
      throw new NotFoundException("저장된 리프레시 토큰이 없습니다.");
    }

    const userToken = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!userToken) {
      throw new NotFoundException("인증 정보가 유효하지 않습니다.");
    }
    const payload = { userId: user.id };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>("JWT_ACCESS_TOKEN_EXPIRATION"),
    });

    return { accessToken };
  }

  public async checkUserForAuth({ id }) {
    return this.userRepository.findOne({ where: { id } });
  }

  // 전화번호 형식 변환 함수
  private formatPhoneNumber(phoneNumber: string) {
    return `+82${phoneNumber.substring(1)}`;
  }
}
