import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookSearchService } from './book-search.service';
import { BookSearchController } from './book-search.controller';
import { BooksEntity } from '../../entities/books.entity';
import { ReviewEntity } from '../../entities/reviews.entity';
import { ConfigService } from '@nestjs/config';
import { WishlistEntity } from '../../entities/wishlist.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([BooksEntity, ReviewEntity, WishlistEntity]),
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
