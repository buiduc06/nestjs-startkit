import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AdminGuard } from 'src/auth/admin.guard';
import { AmbassadorGuard } from 'src/auth/ambassador.guard';
import { AuthGuard } from 'src/auth/auth.guard';
import { AuthService } from 'src/auth/auth.service';
import { Order } from 'src/order/order.model';
import { Product } from 'src/product/product';
import { Link } from './link.model';
import { LinkService } from './link.service';

@Controller()
export class LinkController {
  constructor(
    private linkService: LinkService,
    private authService: AuthService,
  ) {}

  @UseGuards(AdminGuard)
  @Get('admin/users/:id/links')
  async all(@Param('id') id: number) {
    return this.linkService.find({
      user: id,
      relations: ['orders'],
    });
  }

  @UseGuards(AmbassadorGuard)
  @Post('ambassador/links')
  /**
   * It creates a new link and saves it to the database
   * @param {number[]} products - number[] - This is the array of product IDs that we want to save in
   * the link.
   * @param {Request} request - This is the request object that contains the user's session.
   * @returns The link object
   */
  async create(@Body('products') products: number[], @Req() request: Request) {
    const user = await this.authService.user(request);

    return this.linkService.save({
      code: Math.random().toString(36).substring(6),
      user,
      products: products.map((id) => ({ id })),
    });
  }

  @UseGuards(AmbassadorGuard)
  @Get('ambassador/stats')
  /**
   * It returns a list of links, each with a count of completed orders and the total revenue from those
   * orders
   * @param {Request} request - Request - This is the request object that is passed to the controller.
   * @returns An array of objects with the following properties:
   * - code: the code of the link
   * - count: the number of completed orders
   * - revenue: the total revenue of the completed orders
   */
  async stats(@Req() request: Request) {
    const user = await this.authService.user(request);

    const links: Link[] = await this.linkService.find({
      user,
      relations: ['orders'],
    });

    return links.map((link) => {
      const completedOrders: Order[] = link.orders.filter((o) => o.complete);

      return {
        code: link.code,
        count: completedOrders.length,
        revenue: completedOrders.reduce((s, o) => s + o.ambassador_revenue, 0),
      };
    });
  }
}
