import { Module } from '@nestjs/common';
import { Vonage } from '@vonage/server-sdk';
import { AuthService } from './auth.service';
import { CacheModule } from '@nestjs/cache-manager';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Auth } from '@vonage/auth';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { UsersEntity } from '../../entities/users.entity';
import { RefreshTokensEntity } from '../../entities/refresh-tokens.entity';
import { AccessTokenStrategy, RefreshTokenStrategy } from './jwt-strategy';
import { TermsOfServiceEntity } from '../../entities/terms_of_service.entity';

@Module({
  imports: [
    CacheModule.register(),
    PassportModule,
    TypeOrmModule.forFeature([UsersEntity, RefreshTokensEntity, TermsOfServiceEntity]),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('ACCESS_TOKEN_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_ACCESS_TOKEN_EXPIRATION'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
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
  ],
  exports: [AuthService, AccessTokenStrategy, RefreshTokenStrategy, Vonage],
})
export class AuthModule {}
