import "dotenv/config";
import { DataSource } from "typeorm";
import { UsersEntity } from "./src/entities/users.entity";
import { RefreshTokensEntity } from "./src/entities/refresh-tokens.entity";
import { ReviewEntity } from "./src/entities/reviews.entity";
import { OrderEntity } from "./src/entities/orders.entity";
import { LocalCodesEntity } from "./src/entities/localcodes.entity";
import { LikesEntity } from "./src/entities/likes.entity";
import { ChatsEntity } from "./src/entities/chats.entity";
import { ChatRoomUsersEntity } from "./src/entities/chat-rooms-users.entity";
import { ChatRoomEntity } from "./src/entities/chat-rooms.entity";
import { CategoryEntity } from "./src/entities/category.entity";
import { CartsEntity } from "./src/entities/carts.entity";
import { BooksEntity } from "./src/entities/books.entity";
import { BooksCategoryEntity } from "./src/entities/books-category.entity";
import { TermsOfServiceEntity } from "./src/entities/terms_of_service.entity";
import { WishlistEntity } from "./src/entities/wishlist.entity";

export const config = new DataSource({
  type: "mysql",
  url: process.env.MYSQL_URI,
  entities: [
    UsersEntity,
    RefreshTokensEntity,
    ReviewEntity,
    OrderEntity,
    LocalCodesEntity,
    LikesEntity,
    ChatsEntity,
    ChatRoomUsersEntity,
    ChatRoomEntity,
    CategoryEntity,
    CartsEntity,
    BooksEntity,
    BooksCategoryEntity,
    TermsOfServiceEntity,
    WishlistEntity
  ],
  synchronize: true,
  logging: true,
  connectTimeout: 30000, // 30초로 설정
});
