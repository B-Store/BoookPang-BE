import { Controller } from '@nestjs/common';
import { TermsOfServiceService } from './terms-of-service.service';

@Controller('terms-of-service')
export class TermsOfServiceController {
  constructor(private readonly termsOfServiceService: TermsOfServiceService) {}
}
