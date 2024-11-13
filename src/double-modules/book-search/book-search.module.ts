import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { BookSearchService } from './book-search.service';
import { BookSearchController } from './book-search.controller';
import { ConfigService } from '@nestjs/config';
import { BooksModule } from '../../modules/books/books.module';

@Module({
  imports: [
    BooksModule,
    ElasticsearchModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        node: configService.get<string>('ELASTICSEARCH_NODE'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [BookSearchController],
  providers: [BookSearchService],
  exports: [BookSearchService],
})
export class BookSearchModule {}
