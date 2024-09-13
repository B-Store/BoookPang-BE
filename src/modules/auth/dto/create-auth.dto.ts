import { PickType } from "@nestjs/swagger";
import { UsersEntity } from "src/entities/users.entity";

export class CreateAuthDto extends PickType(UsersEntity, [
  'loginId',
  'phoneNumber',
  'password',
  'nickname'
]){}