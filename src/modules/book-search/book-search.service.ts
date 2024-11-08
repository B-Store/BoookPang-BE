import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { SearchResponse } from '@elastic/elasticsearch/lib/api/types';

@Injectable()
export class BookSearchService {
  constructor(
    private elasticsearchService: ElasticsearchService,
  ) {}

  public async findBookSearchList(query: Object, page: number, limit: number) {
    const response = await this.elasticsearchService.search({
      index: 'books',
      body: query,
    });
  
    let total: number;
    if (typeof response.hits.total === 'number') {
      total = response.hits.total;
    } else {
      total = response.hits.total.value;
    }
    
    if (response.hits.hits.length === 0) {
      throw new NotFoundException('도서를 찾을 수 없습니다.');
    }
  
    const books = response.hits.hits.map((hit) => hit._source);
  
    return {
      books,
      total,
      page,
      limit,
    };
  }
  
  public async search(query: object) {
    const response: SearchResponse<any> = await this.elasticsearchService.search({
      index: 'books',
      body: query,
      _source: ['id', 'title', 'author', 'publisher', 'cover', 'averageRating', 'suggest'],
    });
    if (response.hits.hits.length === 0) {
      throw new NotFoundException('도서를 찾을 수 없습니다.');
    }
    return response.hits.hits.map((hit) => hit._source);
  }
}
