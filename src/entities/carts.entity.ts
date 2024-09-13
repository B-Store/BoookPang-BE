import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UsersEntity } from "./users.entity";
import { BooksEntity } from "./books.entity";

@Entity("carts")
export class CartsEntity{
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => UsersEntity, (users) => users.cart, {onDelete: "CASCADE"})
    @JoinColumn({name: "user_id"})
    user: UsersEntity;

    @ManyToOne(() => BooksEntity, (books) => books.cart, {onDelete: "CASCADE"})
    @JoinColumn({name: "book_id"})
    book: BooksEntity

    @Column({name: "quantity"})
    quantity: number;

    @CreateDateColumn({name: "created_at"})
    createdAt: Date;

    @UpdateDateColumn({name: "updated_at"})
    updatedAt: Date;

    @DeleteDateColumn({name: "deleted_at"})
    deletedAt: Date;
}