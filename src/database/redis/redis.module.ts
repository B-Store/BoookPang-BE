import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisConfig } from './redis.config';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: RedisConfig,
      useFactory: (configService: ConfigService) => {
        return new RedisConfig(configService);
      },
      inject: [ConfigService],
    },
    {
      provide: 'REDIS_CLIENT',
      useFactory: (redisConfig: RedisConfig) => {
        return redisConfig.getClient();
      },
      inject: [RedisConfig],
    },
  ],
  exports: ['REDIS_CLIENT', RedisConfig],
})
export class RedisModule {}
