import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BooksMainService } from './books-main.service';
import { BooksMainController } from './books-main.controller';
import { BooksEntity } from '../../entities/books.entity';
import { CategoryEntity } from '../../entities/category.entity';
import { BooksCategoryEntity } from '../../entities/books-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BooksEntity, CategoryEntity, BooksCategoryEntity])],
  controllers: [BooksMainController],
  providers: [BooksMainService],
})
export class BooksMainModule {}
