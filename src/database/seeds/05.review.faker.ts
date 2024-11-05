import { faker } from '@faker-js/faker';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { OrderEntity } from '../../modules/order/entities/orders.entity';
import { ReviewEntity } from '../../modules/review/entities/reviews.entity';
import { UsersEntity } from '../../modules/auth/entities/users.entity';

export class ReviewSeeder implements Seeder {
  constructor(
    private readonly dataSource: DataSource,
  ) {}

  public async run(): Promise<void> {
    const orders = await this.dataSource
      .getRepository(OrderEntity)
      .find({ where: { status: 'completed' } });
    const users = await this.dataSource.getRepository(UsersEntity).find();

    const reviewTitles = [
      '아주 유용한 책입니다!',
      '매우 흥미로운 내용입니다.',
      '읽어볼 가치가 충분한 책!',
      '진짜 만족스러운 경험이었어요.',
      '간결하고 명확한 설명이 좋았습니다.',
      '이 책을 찾고 있었다니! 정말 기쁩니다.',
      '반복해서 읽고 싶은 책입니다.',
      '많은 지식을 얻을 수 있었습니다.',
      '가격 대비 정말 훌륭한 품질입니다.',
      '다시 읽고 싶은 책 중 하나입니다.',
      '정말 많은 것을 배운 책이에요.',
      '읽기 쉽게 잘 써졌습니다.',
      '이 책 덕분에 아이디어가 떠올랐습니다.',
      '친구들에게 꼭 추천하고 싶은 책이에요.',
      '편안한 마음으로 읽기에 정말 좋습니다.',
      '기대보다 훨씬 좋았던 책입니다!',
      '신선한 관점으로 쓰여졌습니다.',
      '베스트셀러의 이유를 알겠어요.',
      '마지막 장이 정말 감동적이었습니다.',
      '짧은 내용이지만 강렬합니다.',
      '주변에 추천하고 싶은 책입니다.',
      '읽을수록 더 감명 깊어집니다.',
      '이해하기 쉬운 사례들이 많습니다.',
      '이 책의 가치는 시간이 지나도 변치 않겠네요.',
      '마음의 평화를 주는 책입니다.',
      '이런 책은 꼭 소장해야 해요.',
      '구성이 뛰어나고 잘 정리된 책입니다.',
      '매일 조금씩 읽고 있습니다.',
      '몰입감이 뛰어나서 시간 가는 줄 몰랐습니다.',
      '매우 만족스러운 독서 경험이었습니다.',
      '인생을 바꿔줄 책 같습니다.',
      '독특한 주제로 흥미롭습니다.',
      '글이 너무 자연스럽고 읽기 편합니다.',
      '이 책 덕분에 제 가치관이 많이 변했습니다.',
      '기대 이상으로 훌륭한 책이었어요.',
      '전문적인 정보가 잘 정리되어 있습니다.',
      '웃으면서 읽을 수 있었던 재미있는 책이에요!',
      '구매를 잘한 것 같아요.',
      '서평을 보고 구매했는데 대만족입니다.',
    ];

    const reviewComments = [
      "이 책은 정말 유용했습니다! 여러 번 읽어도 매번 새롭게 느껴집니다.",
      "내용이 풍부하고 흥미로웠습니다. 특히 실용적인 부분이 인상적이었어요.",
      "이 책은 읽을 가치가 충분하다고 생각합니다. 추천하고 싶어요!",
      "추천받아서 읽었는데 매우 만족스러운 경험이었습니다. 감사해요!",
      "구성이 잘 되어있어서 이해하기 쉽고 재미있었습니다. 여러 번 읽을 거예요.",
      "이런 책을 찾고 있었어요. 유익한 내용에 감사를 드립니다!",
      "다시 읽고 싶은 책입니다. 매번 새로운 통찰을 주네요.",
      "지식이 많이 쌓였습니다. 이 책 덕분에 많은 것을 배우고 있습니다!",
      "가격 대비 품질이 뛰어나서 대단히 만족스러웠습니다. 강력 추천합니다.",
      "한 번 읽고 나면 다시 읽고 싶어지는 책입니다. 너무 좋았어요!",
      "읽으면서 많은 것을 배웠습니다. 특히 저자님께 감사의 인사를 드립니다.",
      "읽기 쉽고 재미있는 책이에요. 시간을 잊고 몰입할 수 있었습니다.",
      "이 책 덕분에 많은 영감을 얻었고, 제 삶에 긍정적인 영향을 주었어요.",
      "모든 친구들에게 추천하고 싶어요. 정말 흥미진진한 책입니다.",
      "편안한 마음으로 읽을 수 있는 책이어서 좋았습니다. 감사해요!",
      "정말 기대 이상이었어요! 다음 책도 꼭 읽어봐야겠어요.",
      "이런 내용은 처음이라 신선했습니다. 흥미롭게 읽었습니다.",
      "역시 베스트셀러인 이유가 있네요. 많은 사람들이 공감할 것 같아요.",
      "특히 마지막 장이 인상 깊었습니다. 여운이 남는 책입니다.",
      "짧지만 굉장히 강렬한 메시지가 담겨 있었습니다. 꼭 읽어보세요.",
      "주변에 꼭 추천할만한 책입니다. 많은 생각을 하게 해줍니다.",
      "읽을수록 더 많은 것을 느끼고 있습니다. 대단히 좋았습니다.",
      "이해하기 쉬운 예시가 많아서 좋았습니다. 배우기 좋은 책이에요.",
      "이 책의 가치는 시간이 지나도 변하지 않을 것 같습니다. 명작입니다.",
      "마음에 여유를 주는 책이네요. 읽으면서 힐링되었습니다.",
      "이런 책은 항상 가지고 있어야 합니다. 소장할 가치가 충분해요.",
      "책의 구성이 좋고 정리가 잘 되어 있어서 훌륭했습니다.",
      "매일 한 페이지씩 읽고 있습니다. 조금씩 쌓이는 재미가 좋네요.",
      "짧은 시간 안에 몰입할 수 있었던 책이었습니다. 추천합니다!",
      "매우 만족스럽고 유익한 독서 시간이었습니다. 다시 읽을 거예요.",
      "이 책이 내 인생을 바꿀 것 같습니다. 정말 좋은 경험이었습니다.",
      "이런 주제를 다룬 책은 처음 접해봤어요. 많은 것을 배웠습니다.",
      "글이 너무 매끄럽고 읽기가 편해서 정말 좋았습니다. 감동이에요.",
      "이 책을 읽고 나서 제 가치관이 많이 바뀌었습니다. 고맙습니다!",
      "기대했던 것 이상으로 훌륭한 책이었습니다. 추천하고 싶어요!",
      "전문적인 지식이 잘 정리되어 있어 초보자도 쉽게 이해할 수 있었습니다.",
      "읽으면서 계속 웃었습니다. 재미있고 감동적이었어요. 추천합니다!",
      "구매하기 정말 잘했다는 생각이 드네요. 후회 없는 선택이었습니다."
    ];

    const data = [];

    for (const order of orders) {
      const user = users.find((user) => user.id === order.userId);

      if (user) {
        const randomComment = reviewComments[Math.floor(Math.random() * reviewComments.length)];
        const randomTitle = reviewTitles[Math.floor(Math.random() * reviewTitles.length)];
        
        data.push({
          userId: user.id,
          bookId: order.bookId,
          stars: faker.number.int({ min: 1, max: 5 }),
          comment: randomComment,
          title: randomTitle,
        });
      }
    }

    if (data.length > 0) {
      await this.dataSource.createQueryBuilder().insert().into(ReviewEntity).values(data).execute();
    }
  }
}
