import { Module } from '@nestjs/common';
import { BookSearchService } from './book-search.service';
import { BookSearchController } from './book-search.controller';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BooksEntity } from '../../entities/books.entity';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [

    ElasticsearchModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        node: configService.get<string>('ELASTICSEARCH_NODE'),
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([BooksEntity]),
  ],
  controllers: [BookSearchController],
  providers: [BookSearchService],
  exports: [BookSearchService],
})
export class BookSearchModule {}
