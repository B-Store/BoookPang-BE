import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { UsersEntity } from './users.entity';

@Entity('local-codes')
export class LocalCodesEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  local_code: string;

  @Column()
  city: string;

  @Column({ nullable: true })
  district: string;

  @Column()
  dong: string;

  @OneToMany(() => UsersEntity, (user) => user.loaclCode)
  user: UsersEntity[];
}
