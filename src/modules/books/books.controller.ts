import { Controller, Get, Param, Query } from '@nestjs/common';
import { BooksService } from './books.service';
import { ApiTags, ApiQuery, ApiParam } from '@nestjs/swagger';


@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}
}
