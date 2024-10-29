import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { BooksEntity } from '../../entities/books.entity';
import { CategoryModule } from '../category/category.module';
import { ReviewModule } from '../review/review.module';
import { BooksCategoryModule } from '../books-category/books-category.module';

@Module({
  imports: [
    CategoryModule,
    BooksCategoryModule,
    ReviewModule,
    TypeOrmModule.forFeature([BooksEntity]),
  ],
  controllers: [BooksController],
  providers: [BooksService],
  exports: [BooksService],
})
export class BooksModule {}
