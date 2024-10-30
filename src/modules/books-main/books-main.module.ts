import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BooksMainService } from './books-main.service';
import { BooksMainController } from './books-main.controller';
import { BooksEntity } from '../../entities/books.entity';
import { CategoryEntity } from '../../entities/category.entity';
import { BooksCategoryEntity } from '../../entities/books-category.entity';
import { OrderModule } from '../order/order.module';
import { CategoryModule } from '../category/category.module';

@Module({
  imports: [
    OrderModule,
    CategoryModule,
    TypeOrmModule.forFeature([BooksEntity, BooksCategoryEntity]),
  ],
  controllers: [BooksMainController],
  providers: [BooksMainService],
})
export class BooksMainModule {}
