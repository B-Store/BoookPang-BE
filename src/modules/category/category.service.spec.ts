import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { CategoryEntity } from '../../entities/category.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('CategoryService', () => {
  let service: CategoryService;
  let mockCategoryRepository: jest.Mocked<CategoryEntity>;

  beforeEach(async () => {
    mockCategoryRepository = {} as unknown as jest.Mocked<CategoryEntity>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: getRepositoryToken(CategoryEntity),
          useValue: mockCategoryRepository,
        },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
