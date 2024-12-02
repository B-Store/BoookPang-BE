import { Module } from '@nestjs/common';
import { BookCategoryListService } from './book-category-list.service';
import { BookCategoryListController } from './book-category-list.controller';
import { BooksModule } from '../../modules/books/books.module';
import { CategoryModule } from '../../modules/category/category.module';
import { BooksCategoryModule } from '../../modules/books-category/books-category.module';
import { ReviewModule } from '../../modules/review/review.module';

@Module({
  imports: [BooksModule, CategoryModule, BooksCategoryModule, ReviewModule],
  controllers: [BookCategoryListController],
  providers: [BookCategoryListService],
})
export class BookCategoryListModule {}
