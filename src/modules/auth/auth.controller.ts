import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { PhoneDto } from './dto/phone-number-dto';
import { ApiTags } from '@nestjs/swagger';
import { VerifyCodeDto } from './dto/verify-code.dto';

@ApiTags('auth')
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
    await this.authService.phoneNumberValidator(verifyCodeDto.phoneNumber, verifyCodeDto.verificationCode);
    return { message: '인증코드가 일치합니다.' };
  }

  /**
   * 로그인 ID 중복 확인
   * @param loginId
   * @returns 
   */
  @Get('check-login-id/:loginId')
  async checkLoginId(@Param('loginId') loginId: string) {
    await this.authService.checkLoginIdAvailability(loginId);
    return { message: '사용 가능한 아이디입니다.' };
  }

  /**
   * 회원가입
   * @param createAuthDto 
   * @returns 
   */
  @Post('sign-up')
  userCreate(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.userCreate(createAuthDto);
  }

  @Get()
  findAll() {
    return this.authService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
    return this.authService.update(+id, updateAuthDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(+id);
  }
}
