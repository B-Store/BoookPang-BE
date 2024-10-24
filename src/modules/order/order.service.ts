import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderEntity } from '../../entities/orders.entity';
import { In, Repository } from 'typeorm';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(OrderEntity)
    private orderRepository: Repository<OrderEntity>
  ){}

  public async getTotalSalesForBooks(bookIds: number[]) {
    const results = await this.orderRepository.find({
      where: { bookId: In(bookIds) },
      select: ['bookId', 'quantity'],
    });
    const totalSales = this.aggregateSales(results);

    return this.formatAndSortSales(totalSales);
  }
  
  // 판매량 집계 메서드
  private aggregateSales(results: { bookId: number; quantity: number }[]) {
    return results.reduce((acc, order) => {
      acc[order.bookId] = (acc[order.bookId] || 0) + order.quantity;
      return acc;
    }, {} as { [key: number]: number });
  }
  
  private formatAndSortSales(totalSales: { [key: number]: number }) {
    return Object.entries(totalSales)
      .map(([bookId, totalQuantity]) => ({
        bookId: Number(bookId),
        totalQuantity,
      }))
      .sort((a, b) => b.totalQuantity - a.totalQuantity);
  }  
}
