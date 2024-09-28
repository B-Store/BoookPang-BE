import { Injectable } from "@nestjs/common";
import { ElasticsearchService } from "@nestjs/elasticsearch";
import { SearchResponse } from "@elastic/elasticsearch/lib/api/types";
import { InjectRepository } from "@nestjs/typeorm";
import { BooksEntity } from "../../entities/books.entity";
import { Like, Repository } from "typeorm";

@Injectable()
export class BookSearchService {
  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    @InjectRepository(BooksEntity)
    private readonly booksRepository: Repository<BooksEntity>,
  ) {}

  async search(query: object) {
    const response: SearchResponse<any> = await this.elasticsearchService.search({
      index: "books",
      body: query,
    });
    return response.hits.hits.map(hit => hit._source);
  }

  async indexAllBooks() {
    const books = await this.booksRepository.find();
    await this.indexBooks(books);
  }
  
  async indexBooks(books: any[]) {
    for (const book of books) {
      const exists = await this.elasticsearchService.exists({
        index: "books",
        id: book.id.toString(),
      });
  
      if (!exists) {
        await this.elasticsearchService.index({
          index: "books",
          id: book.id.toString(),
          body: book,
        });
      } else {
        console.log(`Book with ID ${book.id} already exists.`);
      }
    }
  }

  async findBooks(title: string) {
    // 제목에 해당하는 도서 검색
    const books = await this.booksRepository.find({
      where: {
        title: Like(`%${title}%`), // 제목에 title이 포함된 도서를 찾기
      },
    });
    return books;
  }
}
