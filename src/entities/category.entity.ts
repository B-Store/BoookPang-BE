import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { BooksCategoryEntity } from "./books-category.entity";

@Entity("category")
export class CategoryEntity{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({name: "category"})
    category: string;

    @OneToMany(() => BooksCategoryEntity, (booksCategory) => booksCategory.category, {cascade: true})
    booksCategory: BooksCategoryEntity[];
}