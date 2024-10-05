import { Module } from '@nestjs/common';
import { CartsService } from './carts.service';
import { CardsController } from './carts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartsEntity } from '../../entities/carts.entity';
import { BooksEntity } from '../../entities/books.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CartsEntity, BooksEntity])],
  controllers: [CardsController],
  providers: [CartsService],
})
export class CartsModule {}
