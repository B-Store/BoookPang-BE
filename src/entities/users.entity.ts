
import { SocialProviders } from '../common/customs/enums/enum-social-providers';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { ReviewEntity } from './reviews.entity';
import { LocalCodesEntity } from './localcodes.entity';
import { OrderEntity } from './orders.entity';
import { RefreshTokensEntity } from './refresh-tokens.entity';
import { LikesEntity } from './likes.entity';
import { ChatRoomEntity } from './chat-rooms.entity';
import { ChatsEntity } from './chats.entity';
import { ChatRoomUsersEntity } from './chat-rooms-users.entity';
import { CartsEntity } from './carts.entity';

@Entity('users')
export class UsersEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  phone: string;

  @Column()
  nickname: string;

  @Column({ nullable: true })
  password: string;

  @Column({
    type: 'enum',
    enum: SocialProviders,
    default: SocialProviders.LOCAL,
  })
  provider: SocialProviders;

  @Column()
  address: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @ManyToOne(()=> LocalCodesEntity, (loaclCode)=> loaclCode.user)
  @JoinColumn({ name: 'address' })
  loaclCode: LocalCodesEntity;

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

  @OneToMany(() => CartsEntity, (cart) => cart.user, {cascade: true})
  cart: CartsEntity[];

  @OneToMany(() => OrderEntity, (order) => order.user)
  order: OrderEntity[];
}
