import { Module } from '@nestjs/common';
import { BooksCategoryService } from './books-category.service';
import { BooksCategoryController } from './books-category.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BooksCategoryEntity } from '../books-category/entities/books-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BooksCategoryEntity])],
  controllers: [BooksCategoryController],
  providers: [BooksCategoryService],
  exports: [BooksCategoryService]
})
export class BooksCategoryModule {}
