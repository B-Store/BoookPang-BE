import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookSchedulerService } from './book-scheduler.service';
import { BooksEntity } from '../../modules/books/entities/books.entity';
import { ElasticIndexModuleModule } from '../elastic-index-module/elastic-index-module.module';
import { BookListSeeder } from '../../database/seeds/01.book.seed';
import { BookEditorRecommendedDomesticBooksSeeder } from '../../database/seeds/02.book.ItemEditorChoice';
import { ReviewSeeder } from '../../database/seeds/05.review.faker';
import { OrderSeeder } from '../../database/seeds/04.order.faker';

@Module({
  imports: [
    ElasticIndexModuleModule,
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([BooksEntity]),
  ],
  providers: [BookSchedulerService, BookListSeeder, BookEditorRecommendedDomesticBooksSeeder, OrderSeeder, ReviewSeeder],
  exports: [BookSchedulerService],
})
export class BookSchedulerModule {}
