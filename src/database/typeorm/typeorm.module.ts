import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule as NestTypeOrmModule } from "@nestjs/typeorm";
import { TypeOrmConfig } from "./typeorm.config";

@Module({
  imports: [
    NestTypeOrmModule.forRootAsync({ useClass: TypeOrmConfig }),
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  exports: [NestTypeOrmModule],
})
export class TypeOrmModules {}
