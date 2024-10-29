import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshTokensEntity } from '../../entities/refresh-tokens.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(RefreshTokensEntity)
    private refreshTokenRepository: Repository<RefreshTokensEntity>,
  ) {}

  public async findRefreshToken(userId: number, refreshToken: string) {
    return this.refreshTokenRepository.upsert(
      {
        userId,
        refreshToken,
      },
      {
        conflictPaths: ['userId'],
        skipUpdateIfNoValuesChanged: true,
      },
    );
  }

  public async findUserRefreshToken(userId: number) {
    return this.refreshTokenRepository.findOne({ where: { userId } });
  }
}
