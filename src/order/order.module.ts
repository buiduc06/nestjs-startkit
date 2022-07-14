import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './order.model';
import { OrderItem } from './order-item';
import { OrderItemService } from './order-item.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem])],
  providers: [OrderService, OrderItemService],
  controllers: [OrderController],
})
export class OrderModule {}
