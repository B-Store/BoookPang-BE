import { Controller, Get } from '@nestjs/common';
import { ElasticIndexModuleService } from './elastic-index-module.service';

@Controller('elastic-index-module')
export class ElasticIndexModuleController {
  constructor(private readonly elasticIndexModuleService: ElasticIndexModuleService) {}

  @Get()
  async getAllBooks() {
    const books = await this.elasticIndexModuleService.getAllBooks();
    return books;
  }
}
