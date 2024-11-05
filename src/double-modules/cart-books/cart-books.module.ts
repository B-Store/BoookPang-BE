import { Module } from '@nestjs/common';
import { CartBooksService } from './cart-books.service';
import { CartBooksController } from './cart-books.controller';
import { ShoppingCartModule } from '../../modules/shopping-cart/shopping-cart.module';
import { BooksModule } from '../../modules/books/books.module';

@Module({
  imports: [ShoppingCartModule, BooksModule],
  controllers: [CartBooksController],
  providers: [CartBooksService],
  exports: [CartBooksService],
})
export class CartBooksModule {}
