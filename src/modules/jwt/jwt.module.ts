import { Module } from '@nestjs/common';
import { JwtService } from './jwt.service';
import { AccessTokenStrategy, RefreshTokenStrategy } from './jwt-strategy';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [JwtService, AccessTokenStrategy, RefreshTokenStrategy],
  exports: [AccessTokenStrategy, RefreshTokenStrategy],
})
export class JwtModule {}
