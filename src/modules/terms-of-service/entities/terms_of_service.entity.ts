import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { UsersEntity } from '../../../modules/auth/entities/users.entity';

@Entity('terms_of_service')
export class TermsOfServiceEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  // -- 서비스 이용 약관 동의 여부
  @Column({ name: 'service_terms', nullable: true })
  serviceTerms: boolean;

  // -- 개인정보 처리 방침 동의 여부
  @Column({ name: 'privacy_policy', nullable: true })
  privacyPolicy: boolean;

  // -- 통신사 이용 약관 동의 여부
  @Column({ name: 'carrier_terms', nullable: true })
  carrierTerms: boolean;

  // -- 고유식별정보 처리 방침 동의 여부
  @Column({ name: 'identification_info_policy', nullable: true })
  identificationInfoPolicy: boolean;

  // -- 본인확인 서비스 이용 약관 동의 여부
  @Column({ name: 'verification_service_terms', nullable: true })
  verificationServiceTerms: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @OneToMany(() => UsersEntity, (user) => user.termsOfServiceEntity)
  @JoinColumn({ name: 'user_id' })
  user: UsersEntity[];
}
