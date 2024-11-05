import { Injectable } from '@nestjs/common';
import { BooksService } from '../../modules/books/books.service';
import { ShoppingCartService } from '../../modules/shopping-cart/shopping-cart.service';

@Injectable()
export class CartBooksService {
  constructor(
    private shoppingCartService: ShoppingCartService,
    private bookService: BooksService,
  ) {}

  public async findBookCrat(userId: number) {
    const cartItems = await this.shoppingCartService.findCart(userId);
    const bookIds = cartItems.map((item) => item.bookId);

    const books = await this.bookService.findBooksByIds(bookIds);

    return cartItems.map((item) => ({
      ...item,
      book: books.find((book) => book.id === item.bookId),
    }));
  }
}
