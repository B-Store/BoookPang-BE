import { ConfigService } from '@nestjs/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from 'jsonwebtoken';
import { AuthService } from '../modules/auth/auth.service';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'accessToken') {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('ACCESS_TOKEN_SECRET'),
    });
  }
  async validate(payload: JwtPayload) {
    const { userId } = payload;
    const user = await this.authService.checkUserForAuth({ id: userId });
    if (!user) throw new UnauthorizedException('인증 정보가 유효하지 않습니다.');
    return user;
  }
}

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'refreshToken') {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('REFRESH_TOKEN_SECRET'),
    });
  }
  async validate(payload: JwtPayload) {
    const { userId } = payload;
    const user = await this.authService.checkUserForAuth({ id: userId });
    if (!user) throw new UnauthorizedException('인증 정보가 유효하지 않습니다.');
    return user;
  }
}

@Injectable()
export class JwtAccessGuards extends AuthGuard('accessToken') {}
@Injectable()
export class JwtRefreshGuards extends AuthGuard('refreshToken') {}
