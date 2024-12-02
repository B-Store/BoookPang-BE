import { Controller, Get, UseGuards } from '@nestjs/common';
import { CartBooksService } from './cart-books.service';
import { JwtAccessGuards } from '../../modules/auth/providers/jwt-strategy';
import { RequestTokensByHttp } from '../../decorator/jwt-http-request';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('장바구니')
@Controller('cart-books')
export class CartBooksController {
  constructor(private readonly cartBooksService: CartBooksService) {}

  /**
   * 장바구니 조회
   * @param param
   * @returns
   */
  @Get()
  @UseGuards(JwtAccessGuards)
  async findBookCrat(@RequestTokensByHttp() { user: { userId } }: { user: { userId: number } }) {
    return this.cartBooksService.findBookCrat(userId);
  }
}
