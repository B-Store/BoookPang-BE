import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersEntity } from "src/entities/users.entity";
import { RefreshTokensEntity } from "src/entities/refresh-tokens.entity";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AccessTokenStrategy, RefreshTokenStrategy } from "./jwt-strategy";
import { ConfigService } from "@nestjs/config";
import { Vonage } from "@vonage/server-sdk";
import { Auth } from "@vonage/auth";

@Module({
  imports: [
    PassportModule,
    TypeOrmModule.forFeature([UsersEntity, RefreshTokensEntity]),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>("ACCESS_TOKEN_SECRET"),
        signOptions: {
          expiresIn: configService.get<string>("JWT_ACCESS_TOKEN_EXPIRATION"),
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
