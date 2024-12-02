import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ReviewEntity } from '../../review/entities/reviews.entity';
import { OrderEntity } from '../../order/entities/orders.entity';
import { BooksCategoryEntity } from '../../books-category/entities/books-category.entity';
import { ShoppingCartEntity } from '../../shopping-cart/entities/shopping-cart.entity';
import { WishlistEntity } from '../../wishlists/entities/wishlist.entity';

@Entity('books')
export class BooksEntity {
  @PrimaryGeneratedColumn()
  id: number;

  // 기본 정보
  @Column({ name: 'title' })
  title: string;

  @Column({ name: 'author' })
  author: string;

  @Column({ name: 'publisher' })
  publisher: string;

  @Column({ nullable: true })
  description: string;

  // 가격 정보
  @Column({ name: 'regular_price' })
  regularPrice: number;

  @Column({ name: 'sale_price' })
  salePrice: number;

  @Column()
  mileage: number;

  // 재고 및 식별자
  @Column({ name: 'stock_quantity', type: 'int' })
  stockQuantity: number;

  @Column()
  isbn13: string;

  @Column()
  itemId: string;

  // 미디어 및 링크
  @Column()
  link: string;

  @Column()
  cover: string;

  // 평가 및 검색
  @Column({ name: 'average_rating', type: 'float', nullable: true })
  averageRating: number;

  @Column({ name: 'source_type' })
  sourceType: string;

  @Column({ name: 'search_target' })
  searchTarget: string;

  // 타임스탬프
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @OneToMany(() => ReviewEntity, (review) => review.book)
  review: ReviewEntity[];

  @OneToMany(() => OrderEntity, (order) => order.book)
  order: OrderEntity[];

  @OneToMany(() => BooksCategoryEntity, (booksCategory) => booksCategory.book)
  booksCategory: BooksCategoryEntity[];

  @OneToMany(() => ShoppingCartEntity, (cart) => cart.book, { cascade: true })
  shoppingCart: ShoppingCartEntity[];

  @OneToMany(()=> WishlistEntity, (wishlists) => wishlists.book)
  wishlists: WishlistEntity[];
}