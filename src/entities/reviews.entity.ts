import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { UsersEntity } from './users.entity';
import { BooksEntity } from './books.entity';

@Entity('review')
export class ReviewEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'book_id' })
  bookId: number;

  @Column({ nullable: true })
  title: string;

  @Column()
  comment: string;

  @Column()
  stars: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @ManyToOne(() => UsersEntity, (user) => user.review)
  @JoinColumn({ name: 'user_id' })
  user: UsersEntity;

  @ManyToOne(() => BooksEntity, (book) => book.review)
  @JoinColumn({ name: 'book_id' })
  book: BooksEntity;
}
