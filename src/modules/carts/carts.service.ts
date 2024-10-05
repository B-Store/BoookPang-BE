import { InjectRepository } from "@nestjs/typeorm";
import { CreateCartDto } from "./dto/create-card.dto";
import { Injectable } from "@nestjs/common";
import { CartsEntity } from "src/entities/carts.entity";
import { In, Repository } from "typeorm";
import { BooksEntity } from "../../entities/books.entity";

@Injectable()
export class CartsService {
  constructor(
    @InjectRepository(CartsEntity)
    private cartRepository: Repository<CartsEntity>,
    @InjectRepository(BooksEntity)
    private bookRepository: Repository<BooksEntity>,
  ) {}

  public async createBookCrat(userId: number, createCartDto: CreateCartDto) {
    const { bookId, quantity } = createCartDto;

    const cart = this.cartRepository.create({
      userId,
      bookId,
      quantity,
    });

    return this.cartRepository.save(cart);
  }

  public async findBookCrat(userId: number) {
    const cartItems = await this.cartRepository.find({ where: { userId } });
    const bookIds = cartItems.map((item) => item.bookId);

    const books = await this.bookRepository.find({
      select: [
        "id",
        "title",
        "author",
        "publisher",
        "description",
        "regularPrice",
        "salePrice",
        "mileage",
        "cover",
      ],
      where: { id: In(bookIds) },
    });

    return cartItems.map((item) => ({
      ...item,
      book: books.find((book) => book.id === item.bookId),
    }));
  }
}
