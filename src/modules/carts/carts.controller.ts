import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CartsService } from './carts.service';
import { CreateCartDto } from './dto/create-card.dto';
import { RequestAccessTokenByHttp } from '../../decorator/jwt-http-request';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { JwtAccessGuards } from '../auth/jwt-strategy';

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
    @RequestAccessTokenByHttp() { user: { userId } }: { user: { userId: number } },
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
    @RequestAccessTokenByHttp() { user: { userId } }: { user: { userId: number } },
  ) {
    return this.cartsService.findBookCrat(userId);
  }
}
