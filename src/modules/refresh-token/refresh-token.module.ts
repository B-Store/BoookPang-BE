import { Module } from '@nestjs/common';
import { RefreshTokenService } from './refresh-token.service';
import { RefreshTokenController } from './refresh-token.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshTokensEntity } from './entities/refresh-tokens.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RefreshTokensEntity])],
  controllers: [RefreshTokenController],
  providers: [RefreshTokenService],
  exports: [RefreshTokenService]
})
export class RefreshTokenModule {}
