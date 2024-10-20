import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { DatabaseModule } from './database/typeorm/database.module';
import { ScheduleModule } from '@nestjs/schedule';
import { BooksModule } from './modules/books/books.module';
import { BookSearchModule } from './modules/book-search/book-search.module';
import { CacheModule } from '@nestjs/cache-manager';
import { CartsModule } from './modules/carts/carts.module';
import { BookSchedulerModule } from './schedule/book-scheduler.module';
import { BooksMainModule } from './modules/books-main/books-main.module';
import { BooksListModule } from './modules/books-list/books-list.module';
import { ElasticsearchModule } from '@nestjs/elasticsearch';

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
    ScheduleModule.forRoot(),
    DatabaseModule,
    // 데이터베이스 관련 또는 외부 API 관련
    AuthModule,
    BooksModule,
    BookSearchModule,
    CartsModule,
    BookSchedulerModule,
    BooksMainModule,
    BooksListModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
