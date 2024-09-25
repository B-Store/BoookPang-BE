import { SocialProviders } from "../common/customs/enums/enum-social-providers";
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  OneToOne,
} from "typeorm";
import { ReviewEntity } from "./reviews.entity";
import { OrderEntity } from "./orders.entity";
import { RefreshTokensEntity } from "./refresh-tokens.entity";
import { LikesEntity } from "./likes.entity";
import { ChatsEntity } from "./chats.entity";
import { ChatRoomUsersEntity } from "./chat-rooms-users.entity";
import { CartsEntity } from "./carts.entity";
import { IsNotEmpty, IsString } from "class-validator";

@Entity("users")
export class UsersEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, name: "login_id" })
  loginId: string;

  /**
   * @example 01011111111
   */
  @IsString({ message: "전화번호는 문자열이여야 합니다." })
  @IsNotEmpty({ message: "전화번호는 필수 입력 항목입니다." })
  @Column({ unique: true, nullable: true })
  phoneNumber: string;

  @Column()
  nickname: string;

  @Column({ nullable: true })
  password: string;

  @Column({
    type: "enum",
    enum: SocialProviders,
    default: SocialProviders.LOCAL,
  })
  provider: SocialProviders;

  @Column({ nullable: true })
  address: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @DeleteDateColumn({ name: "deleted_at" })
  deletedAt: Date;

  @OneToMany(() => ReviewEntity, (review) => review.user)
  review: ReviewEntity[];

  @OneToOne(() => RefreshTokensEntity, (refreshToken) => refreshToken.user)
  refreshToken: RefreshTokensEntity;

  @OneToMany(() => LikesEntity, (likes) => likes.user)
  likes: LikesEntity[];

  @OneToMany(() => ChatRoomUsersEntity, (chatRoom) => chatRoom.user)
  chatRoom: ChatRoomUsersEntity[];

  @OneToMany(() => ChatsEntity, (chat) => chat.user)
  chat: ChatsEntity[];

  @OneToMany(() => CartsEntity, (cart) => cart.user, { cascade: true })
  cart: CartsEntity[];

  @OneToMany(() => OrderEntity, (order) => order.user)
  order: OrderEntity[];
}
