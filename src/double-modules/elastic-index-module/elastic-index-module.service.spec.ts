import { Test, TestingModule } from '@nestjs/testing';
import { ElasticIndexModuleService } from './elastic-index-module.service';

describe('ElasticIndexModuleService', () => {
  let service: ElasticIndexModuleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ElasticIndexModuleService],
    }).compile();

    service = module.get<ElasticIndexModuleService>(ElasticIndexModuleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
