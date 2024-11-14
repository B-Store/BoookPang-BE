import { Module } from '@nestjs/common';
import { MainPageService } from './main-page.service';
import { MainPageController } from './main-page.controller';
import { CategoryModule } from '../../modules/category/category.module';
import { OrderModule } from '../../modules/order/order.module';
import { BooksCategoryModule } from '../../modules/books-category/books-category.module';
import { BooksModule } from '../../modules/books/books.module';
import { ReviewModule } from '../../modules/review/review.module';

@Module({
  imports: [ReviewModule, BooksModule, BooksCategoryModule, OrderModule, CategoryModule],
  controllers: [MainPageController],
  providers: [MainPageService],
  exports: [MainPageService]
})
export class MainPageModule {}
