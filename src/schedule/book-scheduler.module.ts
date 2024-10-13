import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookSchedulerService } from './book-scheduler.service';
import { BooksEntity } from '../entities/books.entity';
import { BookSearchModule } from '../modules/book-search/book-search.module';

@Module({
  imports: [ScheduleModule.forRoot(), TypeOrmModule.forFeature([BooksEntity]), BookSearchModule],
  providers: [BookSchedulerService],
  exports: [BookSchedulerService],
})
export class BookSchedulerModule {}
