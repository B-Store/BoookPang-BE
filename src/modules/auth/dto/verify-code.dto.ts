import { PickType } from '@nestjs/swagger';
import { UsersEntity } from '../../../entities/users.entity';

export class VerifyCodeDto extends PickType(UsersEntity, ['phoneNumber']) {
  /**
   * @example 123456
   */
  verificationCode: number;
}
