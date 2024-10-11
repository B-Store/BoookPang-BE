import { PickType } from "@nestjs/swagger";
import { UsersEntity } from "../../../entities/users.entity";

export class CreateUserDto extends PickType(UsersEntity, [
  'loginId',
  'phoneNumber',
  'password',
  'nickname'
]){}
