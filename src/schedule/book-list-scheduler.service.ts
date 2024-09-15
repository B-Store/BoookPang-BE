import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BookListSeeder } from 'src/database/seeds/01.book.seed';
import { DataSource } from 'typeorm';
import { BooksEntity } from '../../src/entities/books.entity';

@Injectable()
export class BookListSchedulerService {
  private readonly logger = new Logger(BookListSchedulerService.name);

  constructor(private dataSource: DataSource) {}

  @Cron(CronExpression.EVERY_DAY_AT_NOON) // 매일 오후 12시
  // @Cron('*/5 * * * *') // 5분마다 실행
  async handleCron() {
    const seeder = new BookListSeeder();

    try {
      await seeder.run(this.dataSource, null);

      await this.updateBookStock();
    } catch (error) {
      this.logger.error('알라딘 API 실행 중 오류 발생:', error);
    }
  }

  private async updateBookStock() {
    const queryRunner = this.dataSource.createQueryRunner();
  
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
  
        const result = await queryRunner.manager
        .createQueryBuilder()
        .update(BooksEntity)
        .set({ stockQuantity: 10 })
        .where("stockQuantity < 10") // 재고가 10개 미만인 경우에만 업데이트
        .execute();
  
      await queryRunner.commitTransaction();
  
      if (result.affected && result.affected > 0) {
        this.logger.log('재고가 10개로 업데이트되었습니다.');
      } else {
        this.logger.log('업데이트할 재고가 없습니다.');
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('재고 업데이트 중 오류 발생:', error);
    } finally {
      await queryRunner.release();
    }
  }
  
}
