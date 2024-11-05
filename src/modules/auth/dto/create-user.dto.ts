import { PickType } from '@nestjs/swagger';
import { UsersEntity } from '../entities/users.entity';
import { TermsOfServiceEntity } from '../../../modules/terms-of-service/entities/terms_of_service.entity';

class UserBaseDto extends PickType(UsersEntity, [
  'externalId',
  'phoneNumber',
  'password',
  'nickname',
]) {}

class TermsOfServiceBaseDto extends PickType(TermsOfServiceEntity, [
  'serviceTerms', 
  'privacyPolicy',
  'carrierTerms',
  'identificationInfoPolicy',
  'verificationServiceTerms'
]) {}

export class CreateUserDto extends UserBaseDto {
  termsOfService: TermsOfServiceBaseDto;
}
