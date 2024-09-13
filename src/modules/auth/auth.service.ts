import * as bcrypt from 'bcrypt';
import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { RedisConfig } from '../../database/redis/redis.config';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersEntity } from 'src/entities/users.entity';
import { Repository } from 'typeorm';
import { AUTH_CONSTANT } from 'src/constants/auth.constant';
import { Auth } from '@vonage/auth';
import { Vonage } from '@vonage/server-sdk';

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
  ) {
    // Vonage 인증 정보 설정
    const credentials = new Auth({
      apiKey: this.configService.get<string>('VONAGE_API_KEY'),
      apiSecret: this.configService.get<string>('VONAGE_API_SECRET'),
    });
    this.vonage = new Vonage(credentials);
  }

  async sendVerificationCode(phoneNumber: string){
    const verificationCode = this.generateVerificationCode();
    const formattedPhoneNumber = this.formatPhoneNumber(phoneNumber);

    await this.redisConfig.saveVerificationCode(
      formattedPhoneNumber,
      verificationCode,
    );

    const from = this.configService.get<string>('VONAGE_SENDER_NUMBER');
    const text = `Your verification code is ${verificationCode}`;
    await this.vonage.sms.send({
      to: formattedPhoneNumber,
      from,
      text,
    });
  }

  async phoneNumberValidator(phoneNumber: string, verificationCode: number) {
    const phoneNumberForm = this.formatPhoneNumber(phoneNumber);
    const userCode =
      await this.redisConfig.getVerificationCode(phoneNumberForm);

    if (+userCode !== verificationCode) {
      throw new BadRequestException('인증코드가 일치하지 않습니다.');
    }
    await this.redisConfig.deleteVerificationCode(phoneNumberForm);
  }

  async checkLoginIdAvailability(loginId: string) {
    const user = await this.userRepository.findOne({ where: { loginId } });
    if (user) {
      throw new BadRequestException('사용중인 아이디입니다.');
    }
  }

  async userCreate(createAuthDto: CreateAuthDto) {
    const { loginId, nickname, password, phoneNumber } = createAuthDto;

    await this.checkLoginIdAvailability(loginId);

    const hashPassword = await bcrypt.hash(
      password,
      AUTH_CONSTANT.HASH_SALT_ROUNDS,
    );

    await this.userRepository.save({
      loginId,
      nickname,
      password: hashPassword,
      phoneNumber,
    });
    return { message: '회원가입 성공하였습니다.' };
  }

  // 인증코드 생성 함수
  private generateVerificationCode(): number {
    return Math.floor(
      this.MIN_VERIFICATION_CODE +
        Math.random() *
          (this.MAX_VERIFICATION_CODE - this.MIN_VERIFICATION_CODE),
    );
  }

// 전화번호 형식 변환 함수
private formatPhoneNumber(phoneNumber: string){
  
  // 항상 '010'으로 시작한다고 가정
  return `+82${phoneNumber.substring(1)}`;
}


  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
