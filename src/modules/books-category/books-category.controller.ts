import { Controller } from '@nestjs/common';
import { BooksCategoryService } from './books-category.service';

@Controller('books-category')
export class BooksCategoryController {
  constructor(private readonly booksCategoryService: BooksCategoryService) {}
}
