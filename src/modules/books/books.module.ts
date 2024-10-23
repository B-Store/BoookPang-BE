import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { BooksEntity } from '../../entities/books.entity';
import { ReviewEntity } from '../../entities/reviews.entity';
import { CategoryEntity } from '../../entities/category.entity';
import { BooksCategoryEntity } from '../../entities/books-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BooksEntity, ReviewEntity, CategoryEntity, BooksCategoryEntity])],
  controllers: [BooksController],
  providers: [BooksService],
  exports: [BooksService]
})
export class BooksModule {}
