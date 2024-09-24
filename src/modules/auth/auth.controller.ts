import { Controller, Get, Post, Body, Patch, Param, Delete } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CreateAuthDto } from "./dto/create-auth.dto";
import { PhoneDto } from "./dto/phone-number-dto";
import { ApiTags } from "@nestjs/swagger";
import { VerifyCodeDto } from "./dto/verify-code.dto";
import { LogInDto } from "./dto/log-in.dto";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 인증코드 전송
   * @param phoneDto
   * @returns
   */
  @Post("verify-phone")
  async sendVerificationCode(@Body() phoneDto: PhoneDto) {
    await this.authService.sendVerificationCode(phoneDto.phoneNumber);
    return { message: "인증코드가 전송되었습니다." };
  }

  /**
   * 인증코드 검사
   * @param verifyCodeDto
   * @returns
   */
  @Post("verify-code")
  async phoneNumberValidator(@Body() verifyCodeDto: VerifyCodeDto) {
    await this.authService.phoneNumberValidator(
      verifyCodeDto.phoneNumber,
      verifyCodeDto.verificationCode,
    );
    return { message: "인증코드가 일치합니다." };
  }

  /**
   * 로그인 ID 중복 확인
   * @param loginId
   * @returns
   */
  @Get("check-login-id/:loginId")
  async checkLoginId(@Param("loginId") loginId: string) {
    await this.authService.checkLoginIdAvailability(loginId);
    return { message: "사용 가능한 아이디입니다." };
  }

  /**
   * 회원가입
   * @param createAuthDto
   * @returns
   */
  @Post("sign-up")
  userCreate(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.userCreate(createAuthDto);
  }

  /**
   * 로그인
   * @param logInDto
   * @returns
   */
  @Post("login")
  async logIn(@Body() logInDto: LogInDto) {
    return this.authService.logIn(logInDto);
  }
  /**
   * 리프레시토큰 검증 후 새 액세스 토큰 발급
   * @param refreshToken
   * @returns
   */
  @Post("refresh-token/:refreshToken")
  async refreshToken(@Body("refreshToken") refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }
}
