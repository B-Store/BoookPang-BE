import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UsersEntity } from '../../auth/entities/users.entity';
import { BooksEntity } from '../../books/entities/books.entity';

@Entity('carts')
export class ShoppingCartEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'book_id' })
  bookId: number;

  @Column({ name: 'quantity' })
  quantity: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true})
  deletedAt: Date;

  @ManyToOne(() => UsersEntity, (users) => users.shoppingCart, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UsersEntity;

  @ManyToOne(() => BooksEntity, (books) => books.shoppingCart, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'book_id' })
  book: BooksEntity;
}
