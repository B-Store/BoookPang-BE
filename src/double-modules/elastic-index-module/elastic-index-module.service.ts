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
            },
          },
        },
      });
      console.log(`Index created with edge_ngram: ${indexName}`);
  }  

  private async indexAllBooks() {
    const books = await this.booksService.findAllBooks();
    const processedBooks = await Promise.all(
      books.map(async (book) => {
        const { reviews, reviewCount } = await this.reviewService.getReviewsAndCount(book.id);
        const scrapCount = await this.wishlistService.findCountWishlist(book.id);
        const priceDifference = book.regularPrice - book.salePrice;
        const discountRate =
          book.regularPrice && book.regularPrice > 0
            ? Math.round(((book.regularPrice - book.salePrice) / book.regularPrice) * 100)
            : 0;
  
        const [reviewData] = reviews.map((review) => ({
          title: review.title,
          comment: review.comment,
          stars: review.stars,
        }));

        return {
          ...book,
          priceDifference,
          discountRate,
          reviewCount,
          scrapCount,
          reviews: reviewData,
        };
      }),
    );
    await this.indexBooks(processedBooks, 'books');
  }
  
  private async indexBooks(books: any[], indexName: string) {
    const bulkData = books.flatMap((book) => [
      { index: { _index: indexName, _id: book.id.toString() } },
      {
        ...book,
        suggest: { input: [book.title], weight: 1 },
        reviews: book.reviews,
      },
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