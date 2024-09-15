import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BookListSeeder } from 'src/database/seeds/01.book.seed';
import { DataSource } from 'typeorm';

@Injectable()
export class BookListSchedulerService {
  private readonly logger = new Logger(BookListSchedulerService.name);

  constructor(private dataSource: DataSource) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  // @Cron('*/5 * * * *') // 5분마다 실행
  async handleCron() {
    const seeder = new BookListSeeder();
    try {
      await seeder.run(this.dataSource, null); 
    } catch (error) {
      this.logger.error('알라딘 API 실행 중 오류 발생:', error);
    }
  }
}
