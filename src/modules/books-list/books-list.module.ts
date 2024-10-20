import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BooksListService } from './books-list.service';
import { BooksListController } from './books-list.controller';
import { BooksEntity } from '../../entities/books.entity';
import { BooksCategoryEntity } from '../../entities/books-category.entity';
import { CategoryEntity } from '../../entities/category.entity';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([BooksEntity, BooksCategoryEntity, CategoryEntity]),
    ElasticsearchModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        node: configService.get<string>('ELASTICSEARCH_NODE'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [BooksListController],
  providers: [BooksListService],
})
export class BooksListModule {}
