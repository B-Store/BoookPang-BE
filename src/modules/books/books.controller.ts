import { Controller, Get, Query } from "@nestjs/common";
import { BooksService } from "./books.service";
import { ApiTags, ApiQuery } from "@nestjs/swagger";

@ApiTags("books")
@Controller("books")
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  /**
   * 책 카테고리 리스트
   * @param page
   * @param limit
   * @param category
   * @returns
   */
  @Get("recommended-books")
  @ApiQuery({ name: "page", required: true, description: "페이지 번호", example: 1 })
  @ApiQuery({ name: "limit", required: true, description: "페이지당 항목 수", example: 4 })
  @ApiQuery({
    name: "category",
    required: true,
    description: "카테고리 (all, book, eBook, Music, Foreign)",
    example: "all",
  })
  findRecommendedBooks(
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 4,
    @Query("category") category: string = "all",
  ) {
    return this.booksService.findRecommendedBooks(page, limit, category);
  }

  /**
   * 신간 리스트
   * @param page
   * @param limit
   * @returns
   */
  @Get("new-books")
  @ApiQuery({ name: "page", required: true, description: "페이지 번호", example: 1 })
  @ApiQuery({ name: "limit", required: true, description: "페이지당 항목 수", example: 10 })
  findNewBooks(@Query("page") page: number = 1, @Query("limit") limit: number = 10) {
    return this.booksService.findNewBooks(page, limit);
  }

  /**
   * 베스트셀러 리스트
   * @param page
   * @param limit
   * @returns
   */
  @Get("bestsellers")
  @ApiQuery({ name: "page", required: true, description: "페이지 번호", example: 1 })
  @ApiQuery({ name: "limit", required: true, description: "페이지당 항목 수", example: 10 })
  findBestsellers(@Query("page") page: number = 1, @Query("limit") limit: number = 10) {
    return this.booksService.findBestsellers(page, limit);
  }

  /**
   * 카테고리 리스트
   * @param category
   * @returns
   */
  @Get("categories")
  @ApiQuery({
    name: "category",
    required: true,
    description: "카테고리(국내도서, 외국도서, 음반, 전자책, DVD",
    example: "국내도서",
  })
  categories(@Query("category") category: string) {
    return this.booksService.categories(category);
  }
}