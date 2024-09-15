import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BookListSeeder } from 'src/database/seeds/01.book.seed';
import { DataSource } from 'typeorm';
import { BooksEntity } from '../../src/entities/books.entity'; // Book 엔티티를 가져옵니다.

@Injectable()
export class BookListSchedulerService {
  private readonly logger = new Logger(BookListSchedulerService.name);

  constructor(private dataSource: DataSource) {}

  @Cron(CronExpression.EVERY_DAY_AT_NOON) // 
  // @Cron('*/5 * * * *') // 5분마다 실행
  async handleCron() {
    const seeder = new BookListSeeder();

    try {
      // 알라딘 API에서 데이터를 가져오는 작업
      await seeder.run(this.dataSource, null);

      // 재고 업데이트 작업
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
