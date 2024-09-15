import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ReviewEntity } from "./reviews.entity";
import { OrderEntity } from "./orders.entity";
import { LikesEntity } from "./likes.entity";
import { BooksCategoryEntity } from "./books-category.entity";
import { CartsEntity } from "./carts.entity";

@Entity("books")
export class BooksEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: "title" })
    title: string; // 책의 제목

    @Column({ name: "author" })
    author: string; // 저자 이름

    @Column({ name: "publisher" })
    publisher: string; // 출판사 이름

    @Column({ name: "regular_price" })
    regularPrice: number; // 책의 정가

    @Column({name: 'sale_price'})
    salePrice: number; // 할인된 가격

    @Column({ name: "stock_quantity", type: 'int' })
    stockQuantity: number; // 재고 수량

    @Column({ name: "average_rating", nullable: true})
    averageRating: number; // 평균 평점

    @Column()
    link: string; // 책의 관련 링크

    @Column()
    cover: string; // 책의 표지 이미지 URL

    @Column()
    mileage: number; // 구매 시 적립되는 마일리지

    @Column()
    isbn13: string; // ISBN13 번호

    @Column()
    itemId: string; // 아이템 ID

    @Column({ nullable: true})
    description: string; // 책의 설명

    @CreateDateColumn({ name: "created_at" })
    createdAt: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt: Date;

    @DeleteDateColumn({ name: "deleted_at" })
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
}
