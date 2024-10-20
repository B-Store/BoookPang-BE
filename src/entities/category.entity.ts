import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BooksCategoryEntity } from './books-category.entity';

@Entity('category')
export class CategoryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  CID: number;

  @Column({ name: 'category_name' })
  categoryName: string;

  @Column()
  mall: string;

  @Column({ nullable: true })
  depth1: string;

  @Column({ nullable: true })
  depth2: string;

  @Column({ nullable: true })
  depth3: string;

  @Column({ nullable: true })
  depth4: string;

  @Column({ nullable: true })
  depth5: string;

  @OneToMany(() => BooksCategoryEntity, (booksCategory) => booksCategory.category, {
    cascade: true,
  })
  booksCategory: BooksCategoryEntity[];
}
