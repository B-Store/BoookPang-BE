import { Controller, Get } from '@nestjs/common';
import { ElasticIndexModuleService } from './elastic-index-module.service';

@Controller('elastic-index-module')
export class ElasticIndexModuleController {
  constructor(private readonly elasticIndexModuleService: ElasticIndexModuleService) {}
}
