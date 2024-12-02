import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { SearchResponse } from '@elastic/elasticsearch/lib/api/types';
import { BooksService } from '../../modules/books/books.service';
import { ReviewService } from '../../modules/review/review.service';

@Injectable()
export class BookSearchService {
  constructor(
    private elasticsearchService: ElasticsearchService,
    private booksService: BooksService,
    private reviewService: ReviewService,
  ) {}

  public async findBookSearch(
    query: object, 
    page?: number, 
    limit?: number
  ) {
    const response: SearchResponse<any> = await this.elasticsearchService.search({
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
    const result = await this.booksService.findBooksIdSearch(books);
    const topReview = await this.reviewService.findTopReviewWithCount(result[0].id);

    const modifiedResult = result.map((book, index) => {
      if (index === 0) {
        return { ...book, topReview: topReview || null };
      }
      return book;
    });
  
    console.log('modifiedResult', modifiedResult);
    return page && limit ? { books: modifiedResult, total, page, limit } : modifiedResult;
  }
}
