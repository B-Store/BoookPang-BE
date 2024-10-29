import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { TermsOfServiceService } from './terms-of-service.service';
import { TermsOfServiceController } from './terms-of-service.controller';
import { TermsOfServiceEntity } from '../../entities/terms_of_service.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TermsOfServiceEntity])],
  controllers: [TermsOfServiceController],
  providers: [TermsOfServiceService],
  exports: [TermsOfServiceService]
})
export class TermsOfServiceModule {}
