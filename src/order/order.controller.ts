import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Logger,
  NotFoundException,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Link } from '../link/link.model';
import { LinkService } from '../link/link.service';
import { Product } from '../product/product.model';
import { ProductService } from '../product/product.service';
import { LoggerService } from '../shared/logger.service';
import { DataSource } from 'typeorm';
import { AuthGuard } from '../auth/auth.guard';
import CreateOrderDto from './dtos/create-order.dto';
import { OrderItem } from './order-item';
import { OrderItemService } from './order-item.service';
import { Order } from './order.model';
import { OrderService } from './order.service';
import { InjectStripe } from 'nestjs-stripe';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Controller()
@UseInterceptors(ClassSerializerInterceptor)
export class OrderController {
  constructor(
    private orderService: OrderService,
    private linkService: LinkService,
    private productSerivce: ProductService,
    private orderItemService: OrderItemService,
    private dataSource: DataSource,
    private loggerService: LoggerService,
    @InjectStripe() private readonly stripeClient: Stripe,
    private configService: ConfigService,
    private eventEmitter: EventEmitter2,
  ) {}

  @UseGuards(AuthGuard)
  @Get('admin/orders')
  async all() {
    return this.orderService.find({
      relations: ['order_items'],
    });
  }

  @Post('checkout/orders')
  /**
   * It creates a new order and saves it to the database
   * @param {CreateOrderDto} body - CreateOrderDto - The body of the request.
   * @returns The source object is being returned.
   */
  async create(@Body() body: CreateOrderDto) {
    /* Checking if the link exists in the database. If it does not exist, it will throw a bad request
    exception. */
    const link: Link = await this.linkService.findOne({
      where: { code: body.code },
      relations: ['user'],
    });

    if (!link) {
      throw new BadRequestException('Invalid link!');
    }

    /* Creating a new query runner and starting a transaction. */
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      /* Creating a new order and saving it to the database. */
      const o = new Order();
      o.user_id = link.user.id;
      o.ambassador_email = link.user.email;
      o.code = body.code;
      o.first_name = body.first_name;
      o.last_name = body.last_name;
      o.email = body.email;
      o.address = body.address;
      o.country = body.country;
      o.city = body.city;
      o.zip = body.zip;

      const order = await queryRunner.manager.save(o);
      let line_items = [];

      /* Creating a new order item for each product in the order. */
      for (let p of body.products) {
        const product: Product = await this.productSerivce.findOne({
          where: { id: p.product_id },
        });

        const orderItem = new OrderItem();
        orderItem.order = order;
        orderItem.product_title = product.title;
        orderItem.price = product.price;
        orderItem.quantity = p.quantity;
        orderItem.ambassador_revenue = 0.1 * product.price * p.quantity;
        orderItem.admin_revenue = 0.9 * product.price * p.quantity;

        await queryRunner.manager.save(orderItem);

        line_items.push({
          name: product.title,
          description: product.description,
          // images: [product.image],
          amount: 100 * product.price,
          currency: 'usd',
          quantity: p.quantity,
        });
      }

      /* Creating a new checkout session. */
      let checkout_url = this.configService.get('CHECKOUT_URL');
      const source = await this.stripeClient.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: line_items,
        success_url: `${checkout_url}/success?source={CHECKOUT_SESSION_ID}`,
        cancel_url: `${checkout_url}/success?error`,
      });

      /* Saving the transaction id to the order. */
      order.transaction_id = source['id'];
      await queryRunner.manager.save(order);

      /* It commits the transaction. */
      await queryRunner.commitTransaction();
      this.loggerService.log(
        `a new order has just been created - id: ${order.id}`,
      );

      return source;
    } catch (error) {
      /* If there is an error, it will rollback the transaction and throw a bad request exception. */
      await queryRunner.rollbackTransaction();
      this.loggerService.error(error);
      throw new BadRequestException();
    } finally {
      await queryRunner.release();
    }
  }

  @Post('checkout/orders/confirm')
  /**
   * It finds an order by the transaction_id, updates the order to complete, and emits an event
   * @param {string} source - The transaction ID of the payment.
   */
  async confirm(@Body('source') source: string) {
    const order = await this.orderService.findOne({
      where: {
        transaction_id: source,
      },
      relations: ['order_items', 'user'],
    });

    if (!order) {
      throw new NotFoundException('order not found');
    }
    await this.orderService.update(order.id, { complete: true });

    await this.eventEmitter.emit('order.completed', order);

    return {
      message: 'success',
    };
  }
}
