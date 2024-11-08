import { DataSource, DeepPartial, Repository } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { BooksEntity } from '../../modules/books/entities/books.entity';
import { CategoryEntity } from '../../modules/category/entities/category.entity';
import { BooksCategoryEntity } from '../../modules/books-category/entities/books-category.entity';
import { Logger } from '@nestjs/common';
import axios from 'axios';

export class BookEditorRecommendedDomesticBooksSeeder implements Seeder {
  private readonly logger = new Logger(BookEditorRecommendedDomesticBooksSeeder.name);

  public async run(dataSource: DataSource): Promise<void> {
    const bookRepository = dataSource.getRepository(BooksEntity);
    const categoryRepository = dataSource.getRepository(CategoryEntity);
    const booksCategoryRepository = dataSource.getRepository(BooksCategoryEntity);
  
    if (!process.env.OPEN_API) {
      this.logger.error('API key가 없습니다.');
      return;
    }
  
    try {
      const categories = await categoryRepository.find({
        select: ['CID'],
        where: { mall: '국내도서' },
        take: 5,
      });
      for (const category of categories) {
        const response = await axios.get('http://www.aladin.co.kr/ttb/api/ItemList.aspx', {
          params: {
            ttbkey: process.env.OPEN_API,
            QueryType: 'ItemEditorChoice',
            MaxResults: 10000,
            start: 1,
            CategoryId: category.CID,
            output: 'js',
            Version: '20131101',
          },
        });
        await this.processResponse(response, bookRepository, categoryRepository, booksCategoryRepository);
      }
    } catch (error) {
      // console.log(error);
    }
  }
  
  private async processResponse(
    response: any,
    bookRepository: Repository<BooksEntity>,
    categoryRepository: Repository<CategoryEntity>,
    booksCategoryRepository: Repository<BooksCategoryEntity>,
  ) {
    if (response.data && Array.isArray(response.data.item)) {
      const books = response.data.item;

      for (const book of books) {
        const { itemId, isbn13 } = book;
        const existingBook = await bookRepository.findOne({ where: { isbn13 } });

        if (!existingBook) {
          const bookDetails = await this.fetchBookDetails(itemId, isbn13);

          if (!bookDetails.description || bookDetails.description.trim() === '') {
            continue;
          }

          const bookEntity = bookRepository.create({
            ...bookDetails,
            stockQuantity: 10,
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
        sourceType: 'ItemEditorChoice',
        searchTarget: 'Book'
      };
    } catch (error) {
      return {};
    }
  }
}
