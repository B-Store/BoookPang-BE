import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { BooksService } from '../../modules/books/books.service';

@Injectable()
export class ElasticIndexModuleService implements OnModuleInit {
  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    private readonly booksService: BooksService,
  ) {}

  async getAllBooks() {
    const result = await this.elasticsearchService.search({
      index: 'books',
      body: {
        query: {
          match_all: {},
        },
      },
    });
    return result.hits.hits.map((hit) => hit._source);
  }

  public async onModuleInit() {
    await this.deleteAndCreateIndex('books');
    await this.indexAllBooks();
  }

  private async deleteAndCreateIndex(indexName: string) {
    if (await this.elasticsearchService.indices.exists({ index: indexName })) {
      await this.elasticsearchService.indices.delete({ index: indexName });
      console.log(`Index deleted: ${indexName}`);
    }

    await this.elasticsearchService.indices.create({
      index: indexName,
      body: {
        settings: {
          number_of_shards: 5,
          number_of_replicas: 5,
          analysis: {
            filter: {
              edge_ngram_filter: {
                type: 'edge_ngram',
                min_gram: 1,
                max_gram: 3,
              },
            },
            analyzer: {
              edge_ngram_analyzer: {
                type: 'custom',
                tokenizer: 'standard',
                filter: ['lowercase', 'edge_ngram_filter'],
              },
            },
          },
        },
        mappings: {
          properties: {
            title: {
              type: 'text',
              analyzer: 'edge_ngram_analyzer',
              search_analyzer: 'standard',
            },
          },
        },
      },
    });
    console.log(`Index created with edge_ngram: ${indexName}`);
  }

  private async indexAllBooks() {
    const books = await this.booksService.findAllBooks();
    const processedBooks = books.map((book) => ({
      id: book.id,
      title: book.title,
    }));

    await this.indexBooks(processedBooks, 'books');
  }

  private async indexBooks(books: any[], indexName: string) {
    const bulkData = books.flatMap((book) => [
      { index: { _index: indexName, _id: book.id.toString() } },
      { id: book.id, title: book.title, suggest: { input: [book.title], weight: 1 } },
    ]);

    await this.elasticsearchService.bulk({
      body: bulkData,
      refresh: true,
    });
  }
}
