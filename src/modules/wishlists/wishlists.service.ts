import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WishlistEntity } from '../../entities/wishlist.entity';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(WishlistEntity)
    private wishlistRepository: Repository<WishlistEntity>,
  ) {}

  public async findCountWishlist(bookId: number) {
    return this.wishlistRepository.count({ where: { book: { id: bookId } } });
  }
}
