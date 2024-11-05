import { PickType } from '@nestjs/swagger';
import { UsersEntity } from '../entities/users.entity';

export class PhoneDto extends PickType(UsersEntity, ['phoneNumber']) {}
