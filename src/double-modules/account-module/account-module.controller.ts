import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AccountModuleService } from './account-module.service';
import { RequestTokensByHttp } from '../../decorator/jwt-http-request';
import { CreateUserDto } from '../../modules/auth/dto/create-user.dto';
import { LogInDto } from '../../modules/auth/dto/log-in.dto';
import { JwtRefreshGuards } from '../../common/jwt-strategy';

@ApiTags('인증')
@Controller('account-module')
export class AccountModuleController {
  constructor(private readonly accountModuleService: AccountModuleService) {}

  /**
   * 회원가입
   * @param createUserDto
   * @returns
   */
  @Post('sign-up')
  async userCreate(@Body() createUserDto: CreateUserDto) {
    await this.accountModuleService.userCreate(createUserDto);
    return { message: '회원가입 성공하였습니다.' };
  }

  /**
   * 로그인
   * @param logInDto
   * @returns
   */
  @Post('sign-in')
  async logIn(@Body() logInDto: LogInDto) {
    return this.accountModuleService.logIn(logInDto);
  }
  
  /**
   * new 액세스 토큰 발급
   * @param param0
   * @returns
   */
  @Post('tokens/refresh')
  @UseGuards(JwtRefreshGuards)
  async refreshToken(@RequestTokensByHttp() { userId, token }: { userId: number; token: string }) {
    {
      return this.accountModuleService.refreshToken(userId, token);
    }
  }
}
