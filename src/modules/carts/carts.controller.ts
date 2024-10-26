import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CartsService } from './carts.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { RequestTokensByHttp } from '../../decorator/jwt-http-request';
import { ApiTags } from '@nestjs/swagger';
import { JwtAccessGuards } from '../jwt/jwt-strategy';
import { UpdateCartDto } from './dto/update-cart.dto';

@ApiTags('장바구니')
@Controller('cart')
export class CardsController {
  constructor(private readonly cartsService: CartsService) {}

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
    return this.cartsService.createBookCrat(userId, createCartDto);
  }

  /**
   * 장바구니 조회
   * @param param
   * @returns
   */
  @Get()
  @UseGuards(JwtAccessGuards)
  async findBookCrat(
    @RequestTokensByHttp() { user: { userId } }: { user: { userId: number } },
  ) {
    return this.cartsService.findBookCrat(userId);
  }

  /**
   * 장바구니 수정
   * @param updateCartDto
   * @param param
   * @returns
   */
  @Patch(':cartId')
  @UseGuards(JwtAccessGuards)
  async updateBookCart(
    @Param('cartId') cartId: number,
    @Body() updateCartDto: UpdateCartDto,
    @RequestTokensByHttp() { user: { userId } }: { user: { userId: number } },
  ) {
    return this.cartsService.updateBookCart(userId, cartId, updateCartDto);
  }

  /**
   * 장바구니 삭제
   * @param cartId
   * @param param
   * @returns
   */
  @Delete(':cartId')
  @UseGuards(JwtAccessGuards)
  async deleteBookCart(
    @Param('cartId') cartId: number,
    @RequestTokensByHttp() { user: { userId } }: { user: { userId: number } },
  ) {
    return this.cartsService.deleteBookCart(userId, cartId);
  }
}
