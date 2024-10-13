import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { SearchResponse } from '@elastic/elasticsearch/lib/api/types';
import { InjectRepository } from '@nestjs/typeorm';
import { BooksEntity } from '../../entities/books.entity';
import { Like, Repository } from 'typeorm';

@Injectable()
export class BookSearchService implements OnModuleInit {
  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    @InjectRepository(BooksEntity)
    private readonly booksRepository: Repository<BooksEntity>,
  ) {}

  public async onModuleInit() {
    await this.createIndex();
    await this.indexAllBooks();
  }

  public async createIndex() {
    const indexExists = await this.elasticsearchService.indices.exists({ index: 'books' });

    if (!indexExists) {
      await this.elasticsearchService.indices.create({
        index: 'books',
        body: {
          settings: {
            number_of_shards: 1,
            number_of_replicas: 1,
          },
          mappings: {
            properties: {
              title: { type: 'text' },
              author: { type: 'text' },
              description: { type: 'text' },
              published_date: { type: 'date' },
            },
          },
        },
      });
      console.log('Index created: books');
    } else {
      console.log('Index already exists: books');
    }
  }

  public async search(query: object) {
    const response: SearchResponse<any> = await this.elasticsearchService.search({
      index: 'books',
      body: query,
    });
    if (response.hits.hits.length === 0) {
      throw new NotFoundException('도서를 찾을 수 없습니다.');
    }
    return response.hits.hits.map((hit) => hit._source);
  }

  private async indexAllBooks() {
    const books = await this.booksRepository.find();
    await this.indexBooks(books);
  }

  private async indexBooks(books: any[]) {
    for (const book of books) {
      const exists = await this.elasticsearchService.exists({
        index: 'books',
        id: book.id.toString(),
      });

      if (!exists) {
        await this.elasticsearchService.index({
          index: 'books',
          id: book.id.toString(),
          body: book,
        });
      } else {
        console.log(`Book with ID ${book.id} already exists.`);
      }
    }
  }

  public async findBooks(title: string) {
    const books = await this.booksRepository.find({
      where: {
        title: Like(`%${title}%`),
      },
    });
    if (books.length === 0) {
      throw new NotFoundException('도서를 찾을 수 없습니다.');
    }
    return books;
  }
}
