import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/typeorm/database.module';
import { ScheduleModule } from '@nestjs/schedule';
import { BooksModule } from './modules/books/books.module';
import { BookSearchModule } from './modules/book-search/book-search.module';
import { CacheModule } from '@nestjs/cache-manager';
import { ShoppingCartModule } from './modules/shopping-cart/shopping-cart.module';
import { BookSchedulerModule } from './double-modules/schedule/book-scheduler.module';
import { WishlistsModule } from './modules/wishlists/wishlists.module';
import { ReviewModule } from './modules/review/review.module';
import { OrderModule } from './modules/order/order.module';
import { RefreshTokenModule } from './modules/refresh-token/refresh-token.module';
import { TermsOfServiceModule } from './modules/terms-of-service/terms-of-service.module';
import { CategoryModule } from './modules/category/category.module';
import { BooksCategoryModule } from './modules/books-category/books-category.module';
import { AccountModuleModule } from './double-modules/account-module/account-module.module';
import { ElasticIndexModuleModule } from './double-modules/elastic-index-module/elastic-index-module.module';
import { AuthModule } from './modules/auth/auth.module';
import { BookDetailModule } from './double-modules/book-detail/book-detail.module';
import { BookListModule } from './double-modules/book-list/book-list.module';
import { CartBooksModule } from './double-modules/cart-books/cart-books.module';

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
    AccountModuleModule,
    ElasticIndexModuleModule,
    BookDetailModule,
    BookListModule,
    // double-modules
    AuthModule,
    BooksModule,
    BookSearchModule,
    BooksCategoryModule,
    ShoppingCartModule,
    BookSchedulerModule,
    WishlistsModule,
    ReviewModule,
    OrderModule,
    RefreshTokenModule,
    TermsOfServiceModule,
    CategoryModule,
    CartBooksModule,
    // modules
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
