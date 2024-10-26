import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewEntity } from '../../entities/reviews.entity';
import { BooksModule } from '../books/books.module';

@Module({
  imports: [
    BooksModule,
    TypeOrmModule.forFeature([ReviewEntity])],
  controllers: [ReviewController],
  providers: [ReviewService],
  exports: [ReviewService]
})
export class ReviewModule {}
