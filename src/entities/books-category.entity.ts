import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { BooksEntity } from "./books.entity";
import { CategoryEntity } from "./category.entity";

@Entity("books-category")
export class BooksCategoryEntity{
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => BooksEntity, (books) => books.booksCategory, {onDelete: "CASCADE"})
    @JoinColumn({name: "book_id"})
    book: BooksEntity

    @ManyToOne(()=> CategoryEntity, (category) => category.booksCategory, {onDelete: "CASCADE"})
    @JoinColumn({name: "category_id"})
    category: CategoryEntity
}