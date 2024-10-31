import { faker } from '@faker-js/faker';
import { UsersEntity } from '../../modules/auth/entities/users.entity';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import * as bcrypt from 'bcrypt';

export class UserSeeder implements Seeder {
  public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<void> {
    const data = [];
    const hashedAdminPassword = await bcrypt.hash('qwer1234', 10);

    data.push({
      externalId: 'admin@bookPang.com',
      nickname: 'admin',
      password: hashedAdminPassword,
      phoneNumber: '01096114518',
    });

    for (let i = 1; i <= 99; i++) {
      const hashedPassword = await bcrypt.hash(faker.internet.password(), 10); // 패스워드 해싱

      data.push({
        externalId: faker.internet.email(),
        nickname: faker.internet.userName(),
        password: hashedPassword,
        phoneNumber: this.generateRandomPhoneNumber(),
      });
    }

    await dataSource.createQueryBuilder().insert().into(UsersEntity).values(data).execute();
  }

  private generateRandomPhoneNumber(): string {
    const randomNumber = faker.number.int({ min: 10000000, max: 99999999 }); // 8자리 랜덤 숫자 생성
    return `010${String(randomNumber)}`;
  }
}
