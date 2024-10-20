import { PickType } from '@nestjs/swagger';
import { UsersEntity } from '../../../entities/users.entity';

export class LogInDto extends PickType(UsersEntity, ['externalId', 'password']) {}
