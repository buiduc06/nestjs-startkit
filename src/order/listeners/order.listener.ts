import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { RedisService } from 'src/shared/redis.service';
import { Order } from '../order.model';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class OrderListener {
  constructor(
    private redisService: RedisService,
    private mailerService: MailerService,
  ) {}

  @OnEvent('order.completed')
  /**
   * When an order is completed, add the ambassador_revenue to the user's name in the rankings sorted
   * set.
   * @param {Order} order - Order - this is the order object that is passed to the event handler
   */
  async handleOrderCompletedEvent(order: Order) {
    const client = this.redisService.getClient();

    /* Adding the ambassador_revenue to the user's name in the rankings sorted set. */
    client.zincrby('rankings', order.ambassador_revenue, order.user.name);

    /* Sending an email to the admin when an order is completed. */
    this.mailerService.sendMail({
      to: 'ducbui.dev@gmail.com',
      subject: 'An order has been completed',
      html: `Order #${order.ambassador_revenue} with a total of #${order.total} has been completed`,
    });

    /* Sending an email to the ambassador when an order is completed. */
    this.mailerService.sendMail({
      to: order.ambassador_email,
      subject: 'An order has been completed',
      html: `You earned #${order.ambassador_revenue} from the link#${order.code}`,
    });
  }
}
