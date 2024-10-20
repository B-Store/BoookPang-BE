import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ReviewEntity } from './reviews.entity';
import { OrderEntity } from './orders.entity';
import { LikesEntity } from './likes.entity';
import { BooksCategoryEntity } from './books-category.entity';
import { CartsEntity } from './carts.entity';
import { WishlistEntity } from './wishlist.entity';

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
  @Column({ name: 'average_rating', nullable: true })
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

  @OneToMany(() => LikesEntity, (likes) => likes.book)
  likes: LikesEntity[];

  @OneToMany(() => BooksCategoryEntity, (booksCategory) => booksCategory.book)
  booksCategory: BooksCategoryEntity[];

  @OneToMany(() => CartsEntity, (cart) => cart.book, { cascade: true })
  cart: CartsEntity[];

  @OneToMany(()=> WishlistEntity, (wishlists) => wishlists.book)
  wishlists: WishlistEntity[];
}