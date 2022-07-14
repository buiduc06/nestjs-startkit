import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AbstractService } from '../shared/abstract.service';
import { Repository } from 'typeorm';
import { Order } from './order.model';

@Injectable()
export class OrderService extends AbstractService {
  constructor(@InjectRepository(Order) orderRepository: Repository<Order>) {
    super(orderRepository);
  }
}
