import { Module } from '@nestjs/common';
import { BookReviewModuleService } from './book-review-module.service';
import { BookReviewModuleController } from './book-review-module.controller';
import { ReviewModule } from '../../modules/review/review.module';
import { BooksModule } from '../../modules/books/books.module';

@Module({
  imports: [ReviewModule, BooksModule],
  controllers: [BookReviewModuleController],
  providers: [BookReviewModuleService],
})
export class BookReviewModuleModule {}
