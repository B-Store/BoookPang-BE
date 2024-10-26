import { Injectable, NotFoundException } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { InjectRepository } from '@nestjs/typeorm';
import { BooksCategoryEntity } from '../../entities/books-category.entity';
import { BooksEntity } from '../../entities/books.entity';
import { CategoryEntity } from '../../entities/category.entity';
import { In, Repository } from 'typeorm';

@Injectable()
export class BooksListService {

  constructor(
    @InjectRepository(BooksEntity)
    private readonly bookRepository: Repository<BooksEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
    @InjectRepository(BooksCategoryEntity)
    private readonly bookCategoryRepository: Repository<BooksCategoryEntity>,
    private elasticsearchService: ElasticsearchService,
  ) {}
  
  public async findBookSearchList(query: Object, page: number, limit: number) {
    const response = await this.elasticsearchService.search({
      index: 'books-list',
      body: query,
    });
  
    let total: number;
    if (typeof response.hits.total === 'number') {
      total = response.hits.total;
    } else {
      total = response.hits.total.value;
    }
    
    if (response.hits.hits.length === 0) {
      throw new NotFoundException('도서를 찾을 수 없습니다.');
    }
  
    const books = response.hits.hits.map((hit) => hit._source);
  
    return {
      books,
      total,
      page,
      limit,
    };
  }

  public async findBookCategoryList(category: string) {
    const data = await this.categoryRepository.find({
      select: ['id'],
      where: { mall: category },
    });
    const categoryIds = data.map((cat) => cat.id);

    const bookCategories = await this.bookCategoryRepository.find({
      select: ['bookId'],
      where: { categoryId: In(categoryIds) },
    });

    const uniqueBookIds = [...new Set(bookCategories.map((item) => item.bookId))];
    return this.bookRepository.find({
      select: ['id', 'title', 'cover', 'author', 'publisher'],
      where: { id: In(uniqueBookIds) },
    });
  }
}
