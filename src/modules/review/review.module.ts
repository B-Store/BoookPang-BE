import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewEntity } from '../../entities/reviews.entity';
import { BooksEntity } from '../../entities/books.entity';
import { BooksModule } from '../books/books.module';

@Module({
  imports: [
    BooksModule,
    TypeOrmModule.forFeature([BooksEntity, ReviewEntity])],
  controllers: [ReviewController],
  providers: [ReviewService],
})
export class ReviewModule {}
