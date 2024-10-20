import {
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { SearchResponse } from '@elastic/elasticsearch/lib/api/types';
import { InjectRepository } from '@nestjs/typeorm';
import { BooksEntity } from '../../entities/books.entity';
import { Like, Repository } from 'typeorm';
import { ReviewEntity } from '../../entities/reviews.entity';
import { WishlistEntity } from '../../entities/wishlist.entity';

@Injectable()
export class BookSearchService implements OnModuleInit {
  constructor(
    @InjectRepository(BooksEntity)
    private booksRepository: Repository<BooksEntity>,
    @InjectRepository(ReviewEntity)
    private reviewsRepository: Repository<ReviewEntity>,
    @InjectRepository(WishlistEntity)
    private wishlistRepository: Repository<WishlistEntity>,
    private elasticsearchService: ElasticsearchService,
  ) {}

  public async onModuleInit() {
    await this.deleteIndex('books-main');
    await this.deleteIndex('books-list');
    await this.createIndex('books-main');
    await this.createIndex('books-list');
    await this.indexAllBooks();
  }

  public async deleteIndex(indexName: string) {
    const indexExists = await this.elasticsearchService.indices.exists({ index: indexName });
    if (indexExists) {
      await this.elasticsearchService.indices.delete({ index: indexName });
      console.log(`Index deleted: ${indexName}`);
    }
  }

  public async createIndex(indexName: string) {
    try {
      const indexExists = await this.elasticsearchService.indices.exists({ index: indexName });

      if (!indexExists) {
        await this.elasticsearchService.indices.create({
          index: indexName,
          body: {
            settings: {
              number_of_shards: 1,
              number_of_replicas: 1,
            },
            mappings: {
              properties: {
                title: { type: 'text' },
                author: { type: 'text' },
                publisher: { type: 'text' },
                description: { type: 'text' },
                reqularPrice: {type: 'integer'},
                salePrice: {type: 'integer'},
                cover: { type: 'text' },
                averageRating: { type: 'float' },
                discountRate: { type: 'integer' },
                reviewCount: { type: 'integer' },
                scrapCount: {type: 'integer'},
                createdAt: {type: 'date'}
              },
            },
          },
        });
        console.log(`Index created: ${indexName}`);
      } else {
        console.log(`Index already exists: ${indexName}`);
      }
    } catch (error) {
      console.error(`Error creating index ${indexName}:`, error);
    }
  }

  public async indexAllBooks() {
    const books = await this.booksRepository.find({
      select: [
        'id',
        'title',
        'author',
        'publisher',
        'regularPrice',
        'salePrice',
        'cover',
        'averageRating',
        'description',
        'createdAt'
      ],
    });

    const processedBooks = await Promise.all(
      books.map(async (book) => {
        const discountRate =
          book.regularPrice && book.regularPrice > 0
            ? Math.round(((book.regularPrice - book.salePrice) / book.regularPrice) * 100)
            : 0;

        const reviewCount = await this.reviewsRepository.count({ where: { bookId: book.id } });
        const scrapCount = await this.wishlistRepository.count({ where: { book: { id: book.id } } });
        const priceDifference = book.regularPrice - book.salePrice;

        return {
          ...book,
          priceDifference,
          discountRate,
          reviewCount,
          scrapCount
        };
      }),
    );

    // books-main 인덱스에는 기본 데이터만 인덱싱
    await this.indexBooks(processedBooks.map(({ id, title, author, publisher, cover, averageRating }) => ({
      id,
      title,
      author,
      publisher,
      cover,
      averageRating,
    })), 'books-main');

    // books-list 인덱스에는 추가 데이터도 포함하여 인덱싱
    await this.indexBooks(processedBooks, 'books-list');
  }

  public async indexBooks(books: any[], indexName: string) {
    for (const book of books) {
      try {
        const exists = await this.elasticsearchService.exists({
          index: indexName,
          id: book.id.toString(),
        });

        if (!exists) {
          await this.elasticsearchService.index({
            index: indexName,
            id: book.id.toString(),
            body: book,
          });
        }
      } catch (error) {
        console.error(`Error indexing book ID ${book.id} in index ${indexName}:`, error);
      }
    }
    console.log(`${books.length} books indexed in ${indexName}.`);
  }

  // public async searchBooks(query: string, indexName: string): Promise<any[]> {
  //   try {
  //     const response: SearchResponse<any> = await this.elasticsearchService.search({
  //       index: indexName,
  //       body: {
  //         query: {
  //           match: { title: query },
  //         },
  //       },
  //     });

  //     if (response.hits.hits.length === 0) {
  //       throw new NotFoundException('도서를 찾을 수 없습니다.');
  //     }

  //     return response.hits.hits.map((hit) => hit._source);
  //   } catch (error) {
  //     console.error(`Error searching books in index ${indexName}:`, error);
  //     throw new InternalServerErrorException('Failed to search books.');
  //   }
  // }

  public async search(query: object) {
    const response: SearchResponse<any> = await this.elasticsearchService.search({
      index: 'books-main',
      body: query,
    });
    if (response.hits.hits.length === 0) {
      throw new NotFoundException('도서를 찾을 수 없습니다.');
    }
    console.log(response.hits.hits);
    return response.hits.hits.map((hit) => hit._source);
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
