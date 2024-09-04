import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UsersEntity } from './users.entity';
import { ChatRoomEntity } from './chat-rooms.entity';

@Entity('chats')
export class ChatsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'chat_room_id' })
  chatRoomId: number;

  @Column({ name: 'sender_id' })
  senderId: number;

  @Column()
  content: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @ManyToOne(() => UsersEntity, (user) => user.chat)
  @JoinColumn({ name: 'user_id' })
  user: UsersEntity;

  @ManyToOne(() => ChatRoomEntity, (chatRoom) => chatRoom.chat)
  @JoinColumn({ name: 'chat_room_id' })
  chatRoom: ChatRoomEntity;
}
