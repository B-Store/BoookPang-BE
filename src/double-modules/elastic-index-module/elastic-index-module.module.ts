import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ConfigService } from '@nestjs/config';
import { ElasticIndexModuleController } from './elastic-index-module.controller';
import { WishlistsModule } from '../../modules/wishlists/wishlists.module';
import { ReviewModule } from '../../modules/review/review.module';
import { BooksModule } from '../../modules/books/books.module';
import { ElasticIndexModuleService } from './elastic-index-module.service';

@Module({
  imports: [
    WishlistsModule,
    ReviewModule,
    BooksModule,
    ElasticsearchModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        node: configService.get<string>('ELASTICSEARCH_NODE'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [ElasticIndexModuleController],
  providers: [ElasticIndexModuleService],
  exports: [ElasticIndexModuleService],
})
export class ElasticIndexModuleModule {}
