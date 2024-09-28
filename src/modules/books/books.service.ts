import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BooksEntity } from "../../entities/books.entity";
import { Repository } from "typeorm";
import { CategoryEntity } from "../../entities/category.entity";

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(BooksEntity)
    private readonly bookRepository: Repository<BooksEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) {}

  async findRecommendedBooks(page: number, limit: number, category: string) {
    const skip = (page - 1) * limit;

    const queryBuilder = this.bookRepository.createQueryBuilder("book");

    if (category !== "all") {
      queryBuilder.where("book.searchTarget = :category", { category });
    }

    const [books, total] = await queryBuilder
      .select([
        "book.id",
        "book.title",
        "book.cover",
        "book.author",
        "book.publisher",
        "book.description",
        "book.salePrice",
      ])
      .orderBy("RAND()")
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: books,
      total,
      page,
      limit,
    };
  }

  async findNewBooks(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [books, total] = await this.bookRepository.findAndCount({
      select: ["id", "title", "cover", "author", "publisher"],
      where: { sourceType: "ItemNewAll" },
      skip,
      take: limit,
    });

    return {
      data: books,
      total,
      page,
      limit,
    };
  }

  async findBestsellers(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [books, total] = await this.bookRepository.findAndCount({
      select: ["id", "title", "cover", "author", "publisher"],
      where: { sourceType: "Bestseller" },
      skip,
      take: limit,
    });

    return {
      data: books,
      total,
      page,
      limit,
    };
  }

  async categories(category: string) {
    const data = await this.categoryRepository.find({
      select: ["id", "depth1"],
      where: { mall: category },
    });
      const uniqueCategories = Array.from(
      new Set(data.map(item => item.depth1).filter(depth1 => depth1 && depth1.trim() !== ""))
    );
    return uniqueCategories;
  }
}
