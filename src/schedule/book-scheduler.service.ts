import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { BookListSeeder } from "../database/seeds/01.book.seed";
import { Repository } from "typeorm";
import { BooksEntity } from "../entities/books.entity";
import { BookSearchService } from "../modules/book-search/book-search.service";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class BookSchedulerService {
  private readonly logger = new Logger(BookSchedulerService.name);

  constructor(
    @InjectRepository(BooksEntity)
    private bookRepository: Repository<BooksEntity>,
    private bookSearchService: BookSearchService,
  ) {}

  @Cron(CronExpression.EVERY_12_HOURS)
  public async handleCron() {
    const seeder = new BookListSeeder();
    await seeder.run(this.bookRepository.manager.connection, null);

    await this.updateBookStock();
    await this.bookSearchService.onModuleInit();
    this.logger.log("모든 도서가 재인덱싱되었습니다.");
  }

  private async updateBookStock() {
    const result = await this.bookRepository
      .createQueryBuilder()
      .update(BooksEntity)
      .set({ stockQuantity: 10 })
      .where("stockQuantity < :stock", { stock: 10 })
      .execute();

    if (result.affected && result.affected > 0) {
      this.logger.log("재고가 10개로 업데이트되었습니다.");
    } else {
      this.logger.log("업데이트할 재고가 없습니다.");
    }
  }
}
