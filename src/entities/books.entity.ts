import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ReviewEntity } from "./reviews.entity";
import { OrderEntity } from "./orders.entity";
import { LikesEntity } from "./likes.entity";
import { BooksCategoryEntity } from "./books-category.entity";
import { CartsEntity } from "./carts.entity";

@Entity("books")
export class BooksEntity{
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column({name: "category_id"})
    categoryId: number;

    @Column({name: "title"})
    title: string;

    @Column({name: "author"})
    author: string;

    @Column({name: "publisher"})
    publisher: string;

    @Column({name: "price"})
    price: number;

    @Column({name: "stock_quantity"})
    stockQuantity: string;

    @Column({name: "average_rating"})
    averageRating: number;

    @CreateDateColumn({name: "created_at"})
    createdAt: Date;

    @UpdateDateColumn({name: "updated_at"})
    updatedAt: Date;

    @DeleteDateColumn({name: "deleted_at"})
    deletedAt: Date;

    @OneToMany(() => ReviewEntity, (review) => review.book)
    review: ReviewEntity[];

    @OneToMany(() => OrderEntity, (order) => order.book)
    order: OrderEntity[];

    @OneToMany(() => LikesEntity, (likes) => likes.book)
    likes: LikesEntity[];

    @OneToMany(() => BooksCategoryEntity, (booksCategory) => booksCategory.book)
    booksCategory: BooksCategoryEntity[];

    @OneToMany(() => CartsEntity, (cart) => cart.book, {cascade: true})
    cart: CartsEntity[];
}