import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { PhoneDto } from './dto/phone-number-dto';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { LogInDto } from './dto/log-in.dto';
import { RequestRefreshTokenByHttp } from 'src/decorator/jwt-http-request';
import { JwtRefreshGuards } from './jwt-strategy';

@ApiTags('인증')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 인증코드 전송
   * @param phoneDto
   * @returns
   */
  @Post('verify-phone')
  async sendVerificationCode(@Body() phoneDto: PhoneDto) {
    await this.authService.sendVerificationCode(phoneDto.phoneNumber);
    return { message: '인증코드가 전송되었습니다.' };
  }

  /**
   * 인증코드 검사
   * @param verifyCodeDto
   * @returns
   */
  @Post('verify-code')
  async phoneNumberValidator(@Body() verifyCodeDto: VerifyCodeDto) {
    await this.authService.phoneNumberValidator(
      verifyCodeDto.phoneNumber,
      verifyCodeDto.verificationCode,
    );
    return { message: '인증코드가 일치합니다.' };
  }

  /**
   * 로그인 ID 중복 확인
   * @param loginId
   * @returns
   */
  @Get('check-login-id/:loginId')
  async checkLoginId(@Param('loginId') loginId: string) {
    console.log(loginId)
    await this.authService.checkLoginIdAvailability(loginId);
    return { message: '사용 가능한 아이디입니다.' };
  }

  /**
   * 회원가입
   * @returns
   * @param createUserDto
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
    @RequestRefreshTokenByHttp() { userId, refreshToken }: { userId: number; refreshToken: string },
  ) {
    {
      return this.authService.refreshToken(userId, refreshToken);
    }
  }
}
