import { PickType } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';
import { UsersEntity } from 'src/entities/users.entity';

export class VerifyCodeDto extends PickType(UsersEntity, ['phoneNumber']) {
  /**
   * @example 123456
   */
  @IsString({ message: '인증 코드는 숫자열이어야 합니다.' })
  @Matches(/^\d{6}$/, { message: '인증 코드는 6자리 숫자여야 합니다.' })
  verificationCode: number;
}
