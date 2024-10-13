import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';

@Injectable()
export class TypeOrmConfig implements TypeOrmOptionsFactory {
  private dataSource: DataSource;

  constructor(private configService: ConfigService) {
    const options = this.createTypeOrmOptions();
    this.dataSource = new DataSource(options as DataSourceOptions);
    this.initialize();
  }

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'mysql',
      url: this.configService.get<string>('MYSQL_URI'),
      logging: ['error', 'warn'],
      synchronize: true,
      entities: [__dirname + '/../../entities/*.entity.{js,ts}'],
    };
  }

  private async initialize() {
    try {
      await this.dataSource.initialize();
      console.log('TypeORM connected successfully!');
    } catch (error) {
      console.error('TypeORM connection error : ', error);
    }
  }
}
