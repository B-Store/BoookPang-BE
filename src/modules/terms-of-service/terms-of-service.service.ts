import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TermsOfServiceEntity } from './entities/terms_of_service.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TermsOfServiceService {
  constructor(
    @InjectRepository(TermsOfServiceEntity)
    private termsOfServiceRepository: Repository<TermsOfServiceEntity>,
  ) {}

  public async saveTermsOfService({
    userId,
    serviceTerms,
    privacyPolicy,
    carrierTerms,
    identificationInfoPolicy,
    verificationServiceTerms,
  }) {
    return this.termsOfServiceRepository.save({
      userId,
      serviceTerms,
      privacyPolicy,
      carrierTerms,
      identificationInfoPolicy,
      verificationServiceTerms,
    });
  }
}
