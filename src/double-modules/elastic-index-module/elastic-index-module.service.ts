import { Injectable, OnModuleInit } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { BooksService } from '../../modules/books/books.service';
import getLogger from '../../common/logger';

const logger = getLogger('ElasticIndexModuleService');

@Injectable()
export class ElasticIndexModuleService implements OnModuleInit {
  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    private readonly booksService: BooksService,
  ) {}

  public async onModuleInit() {
    await this.deleteAndCreateIndex('books');
    await this.indexAllBooks();
  }

  private async deleteAndCreateIndex(indexName: string) {
    if (await this.elasticsearchService.indices.exists({ index: indexName })) {
      await this.elasticsearchService.indices.delete({ index: indexName });
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
  }

  private async indexAllBooks() {
    const books = await this.booksService.findAllBooks();

    const bulkData = books.flatMap((book) => [
      { index: { _index: 'books', _id: book.id.toString() } },
      { id: book.id, title: book.title, suggest: { input: [book.title], weight: 1 } },
    ]);

    await this.elasticsearchService.bulk({
      body: bulkData,
      refresh: true,
    });

    logger.info(`Elasticsearch 인덱스 생성 완료: ${books.length}`);
  }
}
