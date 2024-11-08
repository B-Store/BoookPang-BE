import { faker } from '@faker-js/faker';
import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { BooksEntity } from '../../modules/books/entities/books.entity';
import { OrderEntity } from '../../modules/order/entities/orders.entity';
import { UsersEntity } from '../../modules/auth/entities/users.entity';

export class OrderSeeder implements Seeder {

  public async run(dataSource: DataSource): Promise<void> {
    const users = await dataSource.getRepository(UsersEntity).find();
    const books = await dataSource.getRepository(BooksEntity).find();
    const orderRepository = dataSource.getRepository(OrderEntity)
    const data = [];

    for (let i = 0; i < 100; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomBook = books[Math.floor(Math.random() * books.length)];

      if (randomBook.stockQuantity > 0) {
        let status: string;

        if (i < 80) {
          status = 'completed';
        } else if (i < 90) {
          status = 'paid';
        } else {
          status = 'pending';
        }

        const quantity = faker.number.int({ min: 1, max: Math.min(5, randomBook.stockQuantity) });

        data.push({
          userId: randomUser.id,
          bookId: randomBook.id,
          price: randomBook.salePrice,
          quantity,
          status,
        });
      }
    }
    if (data.length > 0) {
      await orderRepository.save(data)
    }
  }
}
