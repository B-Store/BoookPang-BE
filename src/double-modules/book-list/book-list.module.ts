import { Module } from '@nestjs/common';
import { BooksCategoryModule } from './../../modules/books-category/books-category.module';
import { BooksModule } from '../../modules/books/books.module';
import { BookListService } from './book-list.service';
import { BookListController } from './book-list.controller';
import { OrderModule } from '../../modules/order/order.module';
import { CategoryModule } from '../../modules/category/category.module';

@Module({
  imports: [BooksModule, BooksCategoryModule, OrderModule, CategoryModule],
  controllers: [BookListController],
  providers: [BookListService],
  exports: [BookListService],
})
export class BookListModule {}
