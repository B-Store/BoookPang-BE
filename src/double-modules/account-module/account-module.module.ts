import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AccountModuleService } from './account-module.service';
import { AccountModuleController } from './account-module.controller';
import { RefreshTokenModule } from '../../modules/refresh-token/refresh-token.module';
import { TermsOfServiceModule } from '../../modules/terms-of-service/terms-of-service.module';
import { AuthModule } from '../../modules/auth/auth.module';

@Module({
  imports: [
    RefreshTokenModule,
    TermsOfServiceModule,
    AuthModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('ACCESS_TOKEN_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_ACCESS_TOKEN_EXPIRATION'),
        },
      }),
      inject: [ConfigService],
    }),
    TermsOfServiceModule,
    RefreshTokenModule,
  ],
  controllers: [AccountModuleController],
  providers: [AccountModuleService],
  exports: [AccountModuleService]
})
export class AccountModuleModule {}
