import { Controller, Get, Query } from '@nestjs/common';
import { BookSearchService } from './book-search.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('book-search')
@Controller('book-search')
export class BookSearchController {
  constructor(private readonly searchService: BookSearchService) {}

  /**
   * 도서 검색 서치
   * @param query 
   * @returns 
   */
  @Get()
  async search(@Query('title') title: string) {
    const query = {
      query: {
        match: {
          title: {
            query: title,
            fuzziness: 1,
          },
        },
      },
    };
    return await this.searchService.search(query);
  }

    /**
   * 도서 검색 라이크
   * @param query 
   * @returns 
   */
    @Get('find-book')
    async findBooks(@Query('title') title: string) {
      return await this.searchService.findBooks(title);
    }
  
}
