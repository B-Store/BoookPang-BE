import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity("local-codes")
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
}
