import { Controller, Get, Query } from '@nestjs/common';
import { BookSearchService } from './book-search.service';
import { ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('도서 검색')
@Controller('book-search')
export class BookSearchController {
  constructor(private readonly searchService: BookSearchService) {}

  /**
   * 검색 리스트
   * @param title
   * @param page
   * @param limit
   * @returns
   */
  @Get('search-books-list')
  @ApiQuery({ name: 'title', required: true, description: '검색 내용', example: '책' })
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: '페이지당 문서 수', example: 20 })
  findBookSearchList(
    @Query('title') title: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    const from = (page - 1) * limit;
    const query = {
      query: {
        match_phrase_prefix: {
          title: {
            query: title,
            analyzer: 'edge_ngram_analyzer',
          },
        },
      },
      from,
      size: limit,
    };
    return this.searchService.findBookSearchList(query, page, limit);
  }

  /**
   * 검색 서치
   * @param title
   * @returns
   */
  @Get()
  async search(@Query('title') title: string) {
    const query = {
      query: {
        match_phrase_prefix: {
          title: {
            query: title,
            analyzer: 'edge_ngram_analyzer',
          },
        },
      },
    };
    return this.searchService.findSearch(query);
  }
}
