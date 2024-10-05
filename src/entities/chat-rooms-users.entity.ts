import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { UsersEntity } from "./users.entity";

@Entity("chat_room_users")
export class ChatRoomUsersEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "chat_room_id" })
  chatRoomId: number;

  @Column({ name: "user_id" })
  userId: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @ManyToOne(() => UsersEntity, (user) => user.chatRoom)
  @JoinColumn({ name: "user_id" })
  user: UsersEntity;
}
