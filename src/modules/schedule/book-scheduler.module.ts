import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookSchedulerService } from './book-scheduler.service';
import { BooksEntity } from '../books/entities/books.entity';
import { ElasticIndexModuleModule } from '../../double-modules/elastic-index-module/elastic-index-module.module';

@Module({
  imports: [
    ElasticIndexModuleModule,
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([BooksEntity]),
  ],
  providers: [BookSchedulerService],
  exports: [BookSchedulerService],
})
export class BookSchedulerModule {}
