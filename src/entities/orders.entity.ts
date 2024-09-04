import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UsersEntity } from './users.entity';
import { BooksEntity } from './books.entity';

@Entity('order')
export class OrderEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id'})
  userId: number;

  @Column({name: 'book_id'})
  bookId: number;

  @Column()
  price: number;

  @Column()
  quantity: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @ManyToOne(() => UsersEntity, (user) => user.order)
  @JoinColumn({name: 'user_id'})
  user: UsersEntity[];

  @ManyToOne(() => BooksEntity, (book) => book.order)
  @JoinColumn({ name: 'book_id'})
  book: BooksEntity[];
}