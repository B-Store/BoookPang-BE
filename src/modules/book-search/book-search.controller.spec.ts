import { Test, TestingModule } from '@nestjs/testing';
import { BookSearchController } from './book-search.controller';
import { BookSearchService } from './book-search.service';

describe('BookSearchController', () => {
  let controller: BookSearchController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookSearchController],
      providers: [BookSearchService],
    }).compile();

    controller = module.get<BookSearchController>(BookSearchController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
