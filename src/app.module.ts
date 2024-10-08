import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import  {TypeOrmModules} from './database/typeorm/typeorm.module';
import { RedisModule } from './database/redis/redis.module';
import { ScheduleModule } from '@nestjs/schedule';
import { BookListSchedulerService } from './schedule/book-list-scheduler.service';
import { BooksModule } from './modules/books/books.module';
import { BookSearchModule } from './modules/book-search/book-search.module';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { CacheModule } from '@nestjs/cache-manager';
import { CartsModule } from './modules/carts/carts.module';

@Module({
  imports: [
    CacheModule.register({
      ttl: 180,
      max: 100,
      isGlobal: true,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ElasticsearchModule.registerAsync({
      useFactory: async () => ({
        node: process.env.ELASTICSEARCH_NODE, // 환경 변수에서 노드 URL을 가져옵니다
      }),
    }),
    TypeOrmModules,
    AuthModule,
    RedisModule,
    ScheduleModule.forRoot(),
    BooksModule,
    BookSearchModule,
    CartsModule
  ],
  controllers: [AppController],
  providers: [AppService, BookListSchedulerService],
})
export class AppModule {}
