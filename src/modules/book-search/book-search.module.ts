import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookSearchService } from './book-search.service';
import { BookSearchController } from './book-search.controller';
import { ConfigService } from '@nestjs/config';
import { WishlistEntity } from '../../entities/wishlist.entity';
import { ReviewModule } from '../review/review.module';
import { BooksModule } from '../books/books.module';
import { WishlistsModule } from '../wishlists/wishlists.module';

@Module({
  imports: [
    WishlistsModule,
    ReviewModule,
    BooksModule,
    TypeOrmModule.forFeature([WishlistEntity]),
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
