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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModules,
    AuthModule,
    RedisModule,
    ScheduleModule.forRoot(),
    BooksModule,
  ],
  controllers: [AppController],
  providers: [AppService, BookListSchedulerService],
})
export class AppModule {}
