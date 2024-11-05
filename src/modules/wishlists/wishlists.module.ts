import { Module } from '@nestjs/common';
import { WishlistsService } from './wishlists.service';
import { WishlistsController } from './wishlists.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WishlistEntity } from './entities/wishlist.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WishlistEntity])],
  controllers: [WishlistsController],
  providers: [WishlistsService],
  exports: [WishlistsService]
})
export class WishlistsModule {}
