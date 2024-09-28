import { Module } from '@nestjs/common';
import { BookSearchService } from './book-search.service';
import { BookSearchController } from './book-search.controller';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BooksEntity } from '../../entities/books.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ElasticsearchModule.registerAsync({
      imports: [ConfigModule], // ConfigModule을 가져옴
      useFactory: (configService: ConfigService) => ({
        node: configService.get<string>('ELASTICSEARCH_NODE'),
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([BooksEntity]),
  ],
  controllers: [BookSearchController],
  providers: [BookSearchService],
})
export class BookSearchModule {}
