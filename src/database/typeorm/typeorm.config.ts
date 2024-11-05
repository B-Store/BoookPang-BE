import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

@Injectable()
export class TypeOrmConfig implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'mysql',
      url: this.configService.get<string>('MYSQL_URI'),
      logging: ['error', 'warn'],
      synchronize: true,
      entities: [
        __dirname + '/../../modules/**/entities/*.entity{.ts,.js}',

      ],
    };
  }
}
