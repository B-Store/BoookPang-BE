import {
  Injectable,
  BadRequestException,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Vonage } from '@vonage/server-sdk';
import { Repository } from 'typeorm';
import { Cache } from 'cache-manager';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { UsersEntity } from './entities/users.entity';
import { PhoneDto } from './dto/phone-number-dto';

@Injectable()
export class AuthService {
  public userAuthStates: { [key: string]: { isVerified: boolean } } = {};
  constructor(
    @InjectRepository(UsersEntity)
    private userRepository: Repository<UsersEntity>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    private configService: ConfigService,
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

  public async findExternalId(externalId: string) {
    if (!externalId) {
      throw new BadRequestException('externalId 값을 확인해 주세요.');
    }

    return this.userRepository.findOne({
      where: { externalId, deletedAt: null },
    });
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

  public async userCreate({ externalId, nickname, password, phoneNumber }){
    return this.userRepository.save({externalId, nickname, password, phoneNumber})
  };
  
  public async checkUserForAuth({ id }) {
    return this.userRepository.findOne({ where: { id } });
  }

  public async findUserPhoneNumber(phoneNumber:string){
    return this.userRepository.findOne({where: {phoneNumber: phoneNumber}})
  }
  
  private formatPhoneNumber(phoneNumber: string) {
    if (phoneNumber.length !== 11 || !/^(010)\d{8}$/.test(phoneNumber)) {
      throw new BadRequestException('phoneNumber 값을 다시 확인해 주세요.');
    }
    return `+82${phoneNumber.substring(1)}`;
  }
}
