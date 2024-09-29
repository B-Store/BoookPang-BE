import { Test, TestingModule } from "@nestjs/testing";
import { BooksService } from "./books.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { BooksEntity } from "../../entities/books.entity";
import { Repository } from "typeorm";
import { CategoryEntity } from "../../entities/category.entity";
import { BooksCategoryEntity } from "../../entities/books-category.entity";

describe("BooksService", () => {
  let service: BooksService;
  let mockBooksRepository: Partial<Repository<BooksEntity>>;
  let mockCategoryRepository: Partial<Repository<CategoryEntity>>;
  let mockBooksCategoryRepository: Partial<Repository<BooksCategoryEntity>>;

  beforeEach(async () => {
    mockBooksRepository = {
      find: jest.fn(),
    };

    mockCategoryRepository = {
    };

    mockBooksCategoryRepository = {
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        {
          provide: getRepositoryToken(BooksEntity),
          useValue: mockBooksRepository,
        },
        {
          provide: getRepositoryToken(CategoryEntity),
          useValue: mockCategoryRepository,
        },
        {
          provide: getRepositoryToken(BooksCategoryEntity),
          useValue: mockBooksCategoryRepository,
        },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});