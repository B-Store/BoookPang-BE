import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { BooksService } from '../../modules/books/books.service';
import { ReviewService } from '../../modules/review/review.service';
import { WishlistsService } from '../../modules/wishlists/wishlists.service';

@Injectable()
export class ElasticIndexModuleService implements OnModuleInit {
  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    private readonly booksService: BooksService,
    private readonly wishlistService: WishlistsService,
    private readonly reviewService: ReviewService,
  ) {}

  public async onModuleInit() {
    await this.deleteAndCreateIndex('books-main');
    await this.deleteAndCreateIndex('books-list');
    await this.indexAllBooks();
  }

  private async deleteAndCreateIndex(indexName: string) {
    try {
      // 인덱스가 존재하는 경우 삭제
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
                analyzer: 'edge_ngram_analyzer', // edge_ngram_analyzer 적용
                search_analyzer: 'standard',
              },
              author: { type: 'text' },
              publisher: { type: 'text' },
              description: { type: 'text' },
              regularPrice: { type: 'integer' },
              salePrice: { type: 'integer' },
              cover: { type: 'text' },
              averageRating: { type: 'float' },
              discountRate: { type: 'integer' },
              reviewCount: { type: 'integer' },
              scrapCount: { type: 'integer' },
              createdAt: { type: 'date' },
              suggest: { type: 'completion' },
            },
          },
        },
      });
      console.log(`Index created with edge_ngram: ${indexName}`);
    } catch (error) {
      console.error(`Error creating index ${indexName} with edge_ngram:`, error);
    }
  }  

  private async indexAllBooks() {
    const books = await this.booksService.findAllBooks();
    const processedBooks = await Promise.all(
      books.map(async (book) => {
        const discountRate =
          book.regularPrice && book.regularPrice > 0
            ? Math.round(((book.regularPrice - book.salePrice) / book.regularPrice) * 100)
            : 0;

        const reviewCount = await this.reviewService.findReviewCount(book.id);
        const scrapCount = await this.wishlistService.findCountWishlist(book.id);
        const priceDifference = book.regularPrice - book.salePrice;

        return {
          ...book,
          priceDifference,
          discountRate,
          reviewCount,
          scrapCount,
        };
      }),
    );

    // books-main 인덱스와 books-list 인덱스에 각각 데이터를 인덱싱
    await this.indexBooks(
      processedBooks.map(({ id, title, author, publisher, cover, averageRating }) => ({
        id,
        title,
        author,
        publisher,
        cover,
        averageRating,
      })),
      'books-main',
    );

    await this.indexBooks(processedBooks, 'books-list');
  }

  private async indexBooks(books: any[], indexName: string) {
    const bulkData = books.flatMap((book) => [
      { index: { _index: indexName, _id: book.id.toString() } },
      { ...book, suggest: { input: [book.title], weight: 1 } },
    ]);

    try {
      const { errors } = await this.elasticsearchService.bulk({
        body: bulkData,
        refresh: true,
      });

      if (errors) {
        console.error(`Error bulk indexing books in ${indexName}`);
      } else {
        console.log(`${books.length} books indexed in ${indexName}`);
      }
    } catch (error) {
      console.error(`Bulk indexing failed for index ${indexName}:`, error);
    }
  }
}
