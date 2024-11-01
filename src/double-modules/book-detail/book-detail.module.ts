import { Module } from '@nestjs/common';
import { BookDetailService } from './book-detail.service';
import { BookDetailController } from './book-detail.controller';
import { BooksModule } from '../../modules/books/books.module';
import { ReviewModule } from '../../modules/review/review.module';
import { BooksCategoryModule } from '../../modules/books-category/books-category.module';
import { CategoryModule } from '../../modules/category/category.module';

@Module({
  imports: [CategoryModule, BooksCategoryModule, ReviewModule, BooksModule],
  controllers: [BookDetailController],
  providers: [BookDetailService],
  exports: [BookDetailService],
})
export class BookDetailModule {}
