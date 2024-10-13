import { DataSource, DeepPartial } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { BooksEntity } from '../../entities/books.entity';
import { CategoryEntity } from '../../entities/category.entity';
import { BooksCategoryEntity } from '../../entities/books-category.entity';
import { Logger } from '@nestjs/common';
import axios from 'axios';

export class BookListSeeder implements Seeder {
  private readonly logger = new Logger(BookListSeeder.name);

  public async run(dataSource: DataSource, p0: null): Promise<void> {
    const bookRepository = dataSource.getRepository(BooksEntity);
    const categoryRepository = dataSource.getRepository(CategoryEntity);
    const booksCategoryRepository = dataSource.getRepository(BooksCategoryEntity);

    const queryTypes = [
      'ItemNewAll',
      'ItemNewSpecial',
      'ItemEditorChoice',
      'Bestseller',
      'BlogBest',
    ];
    const searchTargets = ['Book', 'Foreign', 'Music', 'DVD', 'Used', 'eBook'];

    if (!process.env.OPEN_API) {
      this.logger.error('API key is not set in environment variables.');
      return;
    }

    for (const queryType of queryTypes) {
      for (const searchTarget of searchTargets) {
        try {
          const response = await axios.get('http://www.aladin.co.kr/ttb/api/ItemList.aspx', {
            params: {
              ttbkey: process.env.OPEN_API,
              QueryType: queryType,
              MaxResults: 1000,
              start: 1,
              SearchTarget: searchTarget,
              output: 'js',
              Version: '20131101',
            },
          });

          if (response.data && Array.isArray(response.data.item)) {
            const books = response.data.item;

            for (const book of books) {
              const { itemId, isbn13 } = book;
              const existingBook = await bookRepository.findOne({
                where: { isbn13 },
              });

              if (!existingBook) {
                const bookDetails = await this.fetchBookDetails(itemId, isbn13);

                if (!bookDetails.description || bookDetails.description.trim() === '') {
                  this.logger.warn(`Skipping book with ISBN13 ${isbn13} due to empty description.`);
                  continue;
                }

                const bookEntity = bookRepository.create({
                  ...bookDetails,
                  stockQuantity: 10,
                  sourceType: queryType,
                  searchTarget: searchTarget,
                });
                const savedBook = await bookRepository.save(bookEntity);

                for (const categoryId of bookDetails.categories) {
                  const category = await categoryRepository.findOne({
                    where: { CID: categoryId.categoryId },
                  });

                  if (category) {
                    const booksCategory = booksCategoryRepository.create({
                      book: savedBook as DeepPartial<BooksEntity>,
                      category: category as DeepPartial<CategoryEntity>,
                    });
                    await booksCategoryRepository.save(booksCategory);
                  } else {
                    this.logger.warn(`Category with ID ${categoryId} not found.`);
                  }
                }
              } else {
                this.logger.log(`Book with ISBN13 ${isbn13} already exists.`);
              }
            }
          } else {
            this.logger.warn(`No items found for ${queryType} - ${searchTarget}`);
          }
        } catch (error) {
          this.logger.error(`Error processing ${queryType} - ${searchTarget}:`, error);
        }
      }
    }
  }

  private async fetchBookDetails(itemId: string, isbn13: string): Promise<any> {
    const baseUrl = 'http://www.aladin.co.kr/ttb/api/ItemLookUp.aspx';

    try {
      if (!isbn13) {
        this.logger.error('Invalid ISBN13:', isbn13);
        return {};
      }

      const response = await axios.get(baseUrl, {
        params: {
          ttbkey: process.env.OPEN_API,
          ItemIdType: 'ISBN13',
          ItemId: isbn13,
          output: 'js',
          Version: '20131101',
          OptResult:
            'previewImgList,eventList,authors,reviewList,fulldescription,fulldescription2,Toc,Story,categoryIdList,mdrecommend,phraseList',
        },
      });

      if (!response.data || !Array.isArray(response.data.item) || response.data.item.length === 0) {
        this.logger.error(`No data found for ISBN13 ${isbn13}`);
        return {};
      }

      const bookDetails = response.data.item[0];

      return {
        title: bookDetails.title,
        author: bookDetails.author,
        link: bookDetails.link,
        publisher: bookDetails.publisher,
        createdAt: bookDetails.pubDate,
        regularPrice: bookDetails.priceStandard,
        salePrice: bookDetails.priceSales,
        cover: bookDetails.cover,
        mileage: bookDetails.mileage,
        isbn13: bookDetails.isbn13,
        itemId: bookDetails.itemId,
        categoryName: bookDetails.categoryName,
        categories: bookDetails.categoryIdList,
        description: bookDetails.description,
      };
    } catch (error) {
      this.logger.error(`Error fetching details for ISBN13 ${isbn13}:`, error);
      return {};
    }
  }
}
