import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrderEntity } from '../../entities/orders.entity';
import { Repository } from 'typeorm';

describe('OrderService', () => {
  let service: OrderService;
  let mockOrderRepository: Partial<Repository<OrderEntity>>;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: getRepositoryToken(OrderEntity), useValue: mockOrderRepository },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
