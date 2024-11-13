import { faker } from '@faker-js/faker';
import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import * as bcrypt from 'bcrypt';
import { UsersEntity } from '../../modules/auth/entities/users.entity';

export class UserSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const usersRepository = dataSource.getRepository(UsersEntity);
    const data = [];
    const hashedAdminPassword = await bcrypt.hash('qwer1234', 10);

    data.push({
      externalId: 'admin@bookPang.com',
      nickname: 'admin',
      password: hashedAdminPassword,
      phoneNumber: '01096114518',
    });

    const existingEmails = new Set<string>();

    for (let i = 1; i <= 99; i++) {
      const email = this.generateUniqueEmail(existingEmails);
      const hashedPassword = await bcrypt.hash(faker.internet.password(), 10); // 패스워드 해싱

      data.push({
        externalId: email,
        nickname: faker.internet.userName(),
        password: hashedPassword,
        phoneNumber: this.generateRandomPhoneNumber(),
      });
    }
    await usersRepository.save(data);
  }

  private generateRandomPhoneNumber(): string {
    const randomNumber = faker.number.int({ min: 10000000, max: 99999999 }); // 8자리 랜덤 숫자 생성
    return `010${String(randomNumber)}`;
  }

  private generateUniqueEmail(existingEmails: Set<string>): string {
    let email: string;
    do {
      email = faker.internet.email();
    } while (existingEmails.has(email));

    existingEmails.add(email);
    return email;
  }
}
