import { faker } from "@faker-js/faker";
import { DataSource } from "typeorm";
import { Seeder, SeederFactoryManager } from "typeorm-extension";
import { BooksEntity } from "../../modules/books/entities/books.entity"; 
import { OrderEntity } from "../../modules/order/entities/orders.entity";
import { UsersEntity } from "../../modules/auth/entities/users.entity";

export class OrderSeeder implements Seeder {
  public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<void> {
    const users = await dataSource.getRepository(UsersEntity).find();
    const books = await dataSource.getRepository(BooksEntity).find();

    const data = [];

    for (let i = 0; i < 100; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)]; // 랜덤 유저 선택
      const randomBook = books[Math.floor(Math.random() * books.length)]; // 랜덤 책 선택

      if (randomBook.stockQuantity > 0) {
        let status: string;

        if (i < 80) {
          status = 'completed'
        } else if (i < 90) {
          status = 'paid';
        } else {
          status = 'pending';
        }

        const quantity = faker.number.int({ min: 1, max: Math.min(5, randomBook.stockQuantity) }); // 1~5 사이의 랜덤 수량, 재고 수량을 고려

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
      await dataSource.createQueryBuilder().insert().into(OrderEntity).values(data).execute();
    }
  }
}
