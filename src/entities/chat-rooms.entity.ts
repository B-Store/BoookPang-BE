import { CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ChatsEntity } from "./chats.entity";

@Entity('chat_room')
export class ChatRoomEntity{
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({name: "created_at"})
  createdAt: Date;

  @UpdateDateColumn({name: "updated_at"})
  updatedAt: Date;

  @OneToMany(() => ChatsEntity, (chat) => chat.chatRoom)
  chat: ChatsEntity[];
}