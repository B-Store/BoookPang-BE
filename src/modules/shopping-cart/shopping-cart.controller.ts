import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ShoppingCartService } from './shopping-cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { RequestTokensByHttp } from '../../decorator/jwt-http-request';
import { ApiTags } from '@nestjs/swagger';
import { UpdateCartDto } from './dto/update-cart.dto';
import { JwtAccessGuards } from '../../common/jwt-strategy';

@ApiTags('장바구니')
@Controller('ShoppingCart')
export class ShoppingCartController {
  constructor(private readonly shoppingCartService: ShoppingCartService) {}

  /**
   * 장바구니 담기
   * @param createCartDto
   * @param param
   * @returns
   */
  @Post()
  @UseGuards(JwtAccessGuards)
  async createBookCrat(
    @Body() createCartDto: CreateCartDto,
    @RequestTokensByHttp() { user: { userId } }: { user: { userId: number } },
  ) {
    return this.shoppingCartService.createBookCrat(userId, createCartDto);
  }

  /**
   * 장바구니 수정
   * @param updateCartDto
   * @param param
   * @returns
   */
  @Patch(':ShoppingCartId')
  @UseGuards(JwtAccessGuards)
  async updateBookCart(
    @Param('cartId') cartId: number,
    @Body() updateCartDto: UpdateCartDto,
    @RequestTokensByHttp() { user: { userId } }: { user: { userId: number } },
  ) {
    return this.shoppingCartService.updateBookCart(userId, cartId, updateCartDto);
  }

  /**
   * 장바구니 삭제
   * @param cartId
   * @param param
   * @returns
   */
  @Delete(':ShoppingCartId')
  @UseGuards(JwtAccessGuards)
  async deleteBookCart(
    @Param('cartId') cartId: number,
    @RequestTokensByHttp() { user: { userId } }: { user: { userId: number } },
  ) {
    return this.shoppingCartService.deleteBookCart(userId, cartId);
  }
}
