import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { PhoneDto } from './dto/phone-number-dto';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { LogInDto } from './dto/log-in.dto';
import { JwtRefreshGuards } from './jwt-strategy';
import { RequestTokensByHttp } from '../../decorator/jwt-http-request';

@ApiTags('인증')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 인증코드 전송
   * @param phoneDto
   * @returns
   */
  @Post('send-verification-AuthCode')
  async sendVerificationCode(@Body() phoneDto: PhoneDto) {
    await this.authService.sendVerificationCode(phoneDto);
    return { message: '인증코드가 전송되었습니다.' };
  }

  /**
   * 인증코드 검사
   * @param verifyCodeDto
   * @returns
   */
  @Post('validation-AuthCode')
  async phoneNumberValidator(@Body() verifyCodeDto: VerifyCodeDto) {
    await this.authService.phoneNumberValidator(verifyCodeDto);
    return { message: '인증코드가 일치합니다.' };
  }

  /**
   * 로그인 ID 중복 확인
   * @param loginId
   * @returns
   */
  @Get('check-external-id/:externalId')
  async checkExternalId(@Param('externalId') externalId: string) {
    await this.authService.checkExternalId(externalId);
    return { message: '사용 가능한 아이디입니다.' };
  }

  /**
   * 닉네임 중복 확인
   * @param nickname
   * @returns
   */
  @Get('check-nickname/:nickname')
  async checkNickName(@Param('nickname') nickname: string) {
    await this.authService.checkNickName(nickname);
    return { message: '사용 가능한 닉네임입니다.' };
  }

  /**
   * 회원가입
   * @param createUserDto
   * @returns
   */
  @Post('sign-up')
  async userCreate(@Body() createUserDto: CreateUserDto) {
    await this.authService.userCreate(createUserDto);
    return { message: '회원가입 성공하였습니다.' };
  }

  /**
   * 로그인
   * @param logInDto
   * @returns
   */
  @Post('login')
  async logIn(@Body() logInDto: LogInDto) {
    return this.authService.logIn(logInDto);
  }

  /**
   * 리프레시토큰 검증 후 새 액세스 토큰 발급
   * @param param0
   * @returns
   */
  @Post('refresh-token')
  @UseGuards(JwtRefreshGuards)
  async refreshToken(
    @RequestTokensByHttp() { userId, refreshToken }: { userId: number; refreshToken: string },
  ) {
    {
      return this.authService.refreshToken(userId, refreshToken);
    }
  }
}
