import { Module } from '@nestjs/common';
import { Vonage } from '@vonage/server-sdk';
import { AuthService } from './auth.service';
import { CacheModule } from '@nestjs/cache-manager';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Auth } from '@vonage/auth';
import { AuthController } from './auth.controller';
import { UsersEntity } from './entities/users.entity';
import { AccessTokenStrategy, RefreshTokenStrategy } from './providers/jwt-strategy';

@Module({
  imports: [CacheModule.register(), TypeOrmModule.forFeature([UsersEntity])],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: Vonage,
      useFactory: (configService: ConfigService) => {
        const credentials = new Auth({
          apiKey: configService.get<string>('VONAGE_API_KEY'),
          apiSecret: configService.get<string>('VONAGE_API_SECRET'),
        });
        return new Vonage(credentials);
      },
      inject: [ConfigService],
    },
    AccessTokenStrategy, RefreshTokenStrategy
  ],
  exports: [AuthService, Vonage, AccessTokenStrategy, RefreshTokenStrategy],
})
export class AuthModule {}
