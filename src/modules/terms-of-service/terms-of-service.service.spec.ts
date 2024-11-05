import { Test, TestingModule } from '@nestjs/testing';
import { TermsOfServiceService } from './terms-of-service.service';
import { Repository } from 'typeorm';
import { TermsOfServiceEntity } from './entities/terms_of_service.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('TermsOfServiceService', () => {
  let service: TermsOfServiceService;
  let mockTermsOfServiceRepository: jest.Mocked<Repository<TermsOfServiceEntity>>;
  beforeEach(async () => {
    mockTermsOfServiceRepository = {} as unknown as jest.Mocked<Repository<TermsOfServiceEntity>>;
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TermsOfServiceService,
        {
          provide: getRepositoryToken(TermsOfServiceEntity),
          useValue: mockTermsOfServiceRepository,
        },
      ],
    }).compile();

    service = module.get<TermsOfServiceService>(TermsOfServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
