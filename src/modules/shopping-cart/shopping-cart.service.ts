import { InjectRepository } from '@nestjs/typeorm';
import { CreateCartDto } from './dto/create-cart.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ShoppingCartEntity } from './entities/shopping-cart.entity';
import { In, Repository } from 'typeorm';
import { BooksEntity } from '../books/entities/books.entity';
import { UpdateCartDto } from './dto/update-cart.dto';

@Injectable()
export class ShoppingCartService {
  constructor(
    @InjectRepository(ShoppingCartEntity)
    private cartRepository: Repository<ShoppingCartEntity>,
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

  public async updateBookCart(userId: number, cartId: number, updateCartDto: UpdateCartDto) {
    const { quantity } = updateCartDto;

    const cartItem = await this.cartRepository.findOne({ where: { id: cartId, userId } });

    if (!cartItem) {
      throw new NotFoundException('장바구니 항목을 찾을 수 없습니다.');
    }

    cartItem.quantity = quantity;

    return this.cartRepository.save(cartItem);
  }

  public async deleteBookCart(userId: number, cartId: number) {
    const cartItem = await this.cartRepository.findOne({ where: { id: cartId, userId } });

    if (!cartItem) {
      throw new NotFoundException('장바구니 항목을 찾을 수 없습니다.');
    }
    cartItem.deletedAt = new Date();

    return this.cartRepository.save(cartItem);
  }

  public async findCart(userId: number) {
    return this.cartRepository.find({ where: { userId } });
  }
}
