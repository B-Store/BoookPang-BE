import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BookListSeeder } from '../../database/seeds/01.book.seed';
import { Repository } from 'typeorm';
import { BooksEntity } from '../../modules/books/entities/books.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderSeeder } from '../../database/seeds/04.order.faker';
import { ReviewSeeder } from '../../database/seeds/05.review.faker';
import { ElasticIndexModuleService } from '../elastic-index-module/elastic-index-module.service';
import getLogger from '../../common/logger';

const logger = getLogger('books-scheduler')

@Injectable()
export class BookSchedulerService {
  constructor(
    @InjectRepository(BooksEntity)
    private bookRepository: Repository<BooksEntity>,
    private elasticIndexModuleService: ElasticIndexModuleService,
    private bookListSeeder: BookListSeeder,
    private orderSeeder: OrderSeeder,
    private reviewSeeder: ReviewSeeder,
  ) {}

  @Cron(CronExpression.EVERY_12_HOURS)
  public async handleCron() {
    await this.bookListSeeder.run();
    await this.updateBookStock();
    await this.elasticIndexModuleService.onModuleInit();
    logger.info('모든 도서가 재인덱싱되었습니다.');
  }

  @Cron('0 */6 * * *') // 매 6시간마다
  public async seedOrdersAndReviews() {
    await this.orderSeeder.run();
    await this.reviewSeeder.run();

    logger.info('주문 및 리뷰 시딩이 완료되었습니다.');
  }
  
  private async updateBookStock() {
    const result = await this.bookRepository
      .createQueryBuilder()
      .update(BooksEntity)
      .set({ stockQuantity: 10 })
      .where('stockQuantity < :stock', { stock: 10 })
      .execute();

    if (result.affected && result.affected > 0) {
      logger.info('재고가 10개로 업데이트되었습니다.');
    } else {
      logger.info('업데이트할 재고가 없습니다.');
    }
  }
}
