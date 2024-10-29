import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { DatabaseModule } from './database/typeorm/database.module';
import { ScheduleModule } from '@nestjs/schedule';
import { BooksModule } from './modules/books/books.module';
import { BookSearchModule } from './modules/book-search/book-search.module';
import { CacheModule } from '@nestjs/cache-manager';
import { CartsModule } from './modules/carts/carts.module';
import { BookSchedulerModule } from './modules/schedule/book-scheduler.module';
import { BooksMainModule } from './modules/books-main/books-main.module';
import { BooksListModule } from './modules/books-list/books-list.module';
import { WishlistsModule } from './modules/wishlists/wishlists.module';
import { ReviewModule } from './modules/review/review.module';
import { OrderModule } from './modules/order/order.module';
import { JwtModule } from './modules/jwt/jwt.module';
import { RefreshTokenModule } from './modules/refresh-token/refresh-token.module';
import { TermsOfServiceModule } from './modules/terms-of-service/terms-of-service.module';
import { CategoryModule } from './modules/category/category.module';
import { BooksCategoryModule } from './modules/books-category/books-category.module';

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
    BooksMainModule,
    BooksListModule,
    BooksCategoryModule,
    CartsModule,
    BookSchedulerModule,
    WishlistsModule,
    ReviewModule,
    OrderModule,
    JwtModule,
    RefreshTokenModule,
    TermsOfServiceModule,
    CategoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
