import { DataSource, DeepPartial } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { BooksEntity } from '../../modules/books/entities/books.entity';
import { CategoryEntity } from '../../modules/category/entities/category.entity';
import { BooksCategoryEntity } from '../../modules/books-category/entities/books-category.entity';
import { Logger } from '@nestjs/common';
import axios from 'axios';

export class BookListSeeder implements Seeder {
  private readonly logger = new Logger(BookListSeeder.name);

  public async run(dataSource: DataSource, p0: null): Promise<void> {
    const bookRepository = dataSource.getRepository(BooksEntity);
    const categoryRepository = dataSource.getRepository(CategoryEntity);
    const booksCategoryRepository = dataSource.getRepository(BooksCategoryEntity);

    const queryTypes = [
      'ItemNewAll', // 신간 전체 리스트
      'ItemNewSpecial', // 주목할 만한 신간 리스트
      'ItemEditorChoice', // 편집자 추천 리스트 (카테고리로만 조회가능 - 국내도서 / 음반 / 외서)
      'Bestseller', // 베스트셀러
      'BlogBest', // 블로거 베스트셀러 (국내도서만 조회 가능)
    ];
    const searchTargets = ['Book', 'Foreign', 'eBook'];

    if (!process.env.OPEN_API) {
      this.logger.error('API ker가 없습니다.');
      return;
    }

    for (const queryType of queryTypes) {
      for (const searchTarget of searchTargets) {
        try {
          const response = await axios.get('http://www.aladin.co.kr/ttb/api/ItemList.aspx', {
            params: {
              ttbkey: process.env.OPEN_API,
              QueryType: queryType,
              MaxResults: 10000,
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
                  }
                }
              }
            }
          }
        } catch (error) {
          // this.logger.error(`Error processing ${queryType} - ${searchTarget}:`, error);
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
      return {};
    }
  }
}