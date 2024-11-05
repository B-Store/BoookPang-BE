import { SocialProviders } from '../../../common/enum-social-providers';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { OrderEntity } from '../../order/entities/orders.entity';
import { ShoppingCartEntity } from '../../shopping-cart/entities/shopping-cart.entity';
import { WishlistEntity } from '../../wishlists/entities/wishlist.entity';
import { RefreshTokensEntity } from '../../../modules/refresh-token/entities/refresh-tokens.entity';
import { TermsOfServiceEntity } from '../../../modules/terms-of-service/entities/terms_of_service.entity';
import { ReviewEntity } from '../../../modules/review/entities/reviews.entity';

@Entity('users')
export class UsersEntity {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * @example example@gmail.com
   */
  @Column({ unique: true, name: 'external_id' })
  externalId: string;

  /**
   * @example 01011111111
   */
  @Column({ unique: true, nullable: true })
  phoneNumber: string;

  /**
   * @example bookPang
   */
  @Column()
  nickname: string;

  /**
   * @example bookpang12345
   */
  @Column({ nullable: true })
  password: string;

  @Column({
    type: 'enum',
    enum: SocialProviders,
    default: SocialProviders.LOCAL,
  })
  provider: SocialProviders;

  @Column({ nullable: true })
  address: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @OneToMany(() => ReviewEntity, (review) => review.user)
  review: ReviewEntity[];

  @OneToOne(() => RefreshTokensEntity, (refreshToken) => refreshToken.user)
  refreshToken: RefreshTokensEntity;

  @OneToMany(() => ShoppingCartEntity, (cart) => cart.user, { cascade: true })
  shoppingCart: ShoppingCartEntity[];

  @OneToMany(() => OrderEntity, (order) => order.user)
  order: OrderEntity[];

  @OneToMany(() => TermsOfServiceEntity, (termsOfService) => termsOfService.user)
  termsOfServiceEntity: TermsOfServiceEntity[];

  @OneToMany(()=> WishlistEntity, (wishlists) => wishlists.user)
  wishlists: WishlistEntity[];
}
