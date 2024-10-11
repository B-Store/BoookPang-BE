import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { TypeOrmModule } from './database/typeorm/typeorm.module';
import { ScheduleModule } from '@nestjs/schedule';
import { BooksModule } from './modules/books/books.module';
import { BookSearchModule } from './modules/book-search/book-search.module';
import { CacheModule } from '@nestjs/cache-manager';
import { CartsModule } from './modules/carts/carts.module';
import { BookSchedulerModule } from './schedule/book-scheduler.module';

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
    TypeOrmModule,
    AuthModule,
    BooksModule,
    BookSearchModule,
    CartsModule,
    BookSchedulerModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
