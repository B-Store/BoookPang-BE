import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { PhoneDto } from './dto/phone-number-dto';
import { VerifyCodeDto } from './dto/verify-code.dto';

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
}
