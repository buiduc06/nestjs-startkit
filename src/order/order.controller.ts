import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { OrderService } from './order.service';

@Controller()
@UseInterceptors(ClassSerializerInterceptor)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @UseGuards(AuthGuard)
  @Get('admin/orders')
  async all() {
    return this.orderService.find({
      relations: ['order_items'],
    });
  }
}
