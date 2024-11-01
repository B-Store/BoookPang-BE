import { Test, TestingModule } from '@nestjs/testing';
import { AccountModuleService } from './account-module.service';

describe('AccountModuleService', () => {
  let service: AccountModuleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccountModuleService],
    }).compile();

    service = module.get<AccountModuleService>(AccountModuleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
