import "dotenv/config";
import { UsersEntity } from "./src/modules/auth/entities/users.entity";
import { BooksCategoryEntity } from "./src/modules/books-category/entities/books-category.entity";
import { BooksEntity } from "./src/modules/books/entities/books.entity";
import { ShoppingCartEntity } from "./src/modules/shopping-cart/entities/shopping-cart.entity";
import { CategoryEntity } from "./src/modules/category/entities/category.entity";
import { OrderEntity } from "./src/modules/order/entities/orders.entity";
import { RefreshTokensEntity } from "./src/modules/refresh-token/entities/refresh-tokens.entity";
import { ReviewEntity } from "./src/modules/review/entities/reviews.entity";
import { TermsOfServiceEntity } from "./src/modules/terms-of-service/entities/terms_of_service.entity";
import { WishlistEntity } from "./src/modules/wishlists/entities/wishlist.entity";
import { DataSource } from "typeorm";

export const config = new DataSource({
  type: "mysql",
  url: process.env.MYSQL_URI,
  entities: [
    UsersEntity,
    RefreshTokensEntity,
    ReviewEntity,
    OrderEntity,
    CategoryEntity,
    ShoppingCartEntity,
    BooksEntity,
    BooksCategoryEntity,
    TermsOfServiceEntity,
    WishlistEntity
  ],
  synchronize: true,
  logging: true,
});
