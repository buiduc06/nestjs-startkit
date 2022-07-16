import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { RedisService } from 'src/shared/redis.service';
import { Order } from '../order.model';

@Injectable()
export class OrderListener {
  constructor(private redisService: RedisService) {}

  @OnEvent('order.completed')
  /**
   * When an order is completed, add the ambassador_revenue to the user's name in the rankings sorted
   * set.
   * @param {Order} order - Order - this is the order object that is passed to the event handler
   */
  async handleOrderCompletedEvent(order: Order) {
    const client = this.redisService.getClient();

    client.zincrby('rankings', order.ambassador_revenue, order.user.name);
    console.log('dispatch order.completed', order);
  }
}
