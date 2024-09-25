import { Module } from '@nestjs/common';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BooksEntity } from '../../entities/books.entity';
import { CategoryEntity } from '../../entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BooksEntity, CategoryEntity])],
  controllers: [BooksController],
  providers: [BooksService],
})
export class BooksModule {}
