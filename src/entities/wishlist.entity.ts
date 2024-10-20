import { Entity, Column, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { UsersEntity } from './users.entity';
import { BooksEntity } from './books.entity';

@Entity('wishlists')
export class WishlistEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'book_id' })
  bookId: number;

  @Column({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => UsersEntity, (user) => user.wishlists)
  @JoinColumn({ name: 'user_id' })
  user: UsersEntity;

  @ManyToOne(() => BooksEntity, (book) => book.wishlists)
  @JoinColumn({ name: 'book_id' })
  book: BooksEntity;
}
