import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BookListSeeder } from '../../database/seeds/01.book.seed';
import { Repository } from 'typeorm';
import { BooksEntity } from '../books/entities/books.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderSeeder } from '../../database/seeds/04.order.faker';
import { ReviewSeeder } from '../../database/seeds/05.review.faker';
import { ElasticIndexModuleService } from '../../double-modules/elastic-index-module/elastic-index-module.service';

@Injectable()
export class BookSchedulerService {
  constructor(
    @InjectRepository(BooksEntity)
    private bookRepository: Repository<BooksEntity>,
    private elasticIndexModuleService: ElasticIndexModuleService,
  ) {}

  @Cron(CronExpression.EVERY_12_HOURS)
  public async handleCron() {
    const seeder = new BookListSeeder();
    await seeder.run(this.bookRepository.manager.connection, null);

    await this.updateBookStock();
    await this.elasticIndexModuleService.onModuleInit();
    console.log('모든 도서가 재인덱싱되었습니다.');
  }

  @Cron('0 */6 * * *') // 매 6시간마다
  public async seedOrdersAndReviews() {
    const orderSeeder = new OrderSeeder();
    const reviewSeeder = new ReviewSeeder();

    await orderSeeder.run(this.bookRepository.manager.connection, null);
    await reviewSeeder.run(this.bookRepository.manager.connection, null);

    console.log('주문 및 리뷰 시딩이 완료되었습니다.');
  }
  
  private async updateBookStock() {
    const result = await this.bookRepository
      .createQueryBuilder()
      .update(BooksEntity)
      .set({ stockQuantity: 10 })
      .where('stockQuantity < :stock', { stock: 10 })
      .execute();

    if (result.affected && result.affected > 0) {
      console.log('재고가 10개로 업데이트되었습니다.');
    } else {
      console.log('업데이트할 재고가 없습니다.');
    }
  }
}
