import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewEntity } from '../../entities/reviews.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReviewEntity])],
  controllers: [ReviewController],
  providers: [ReviewService],
  exports: [ReviewService]
})
export class ReviewModule {}
