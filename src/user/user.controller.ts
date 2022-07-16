import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard';
import { AmbassadorGuard } from '../auth/ambassador.guard';
import { User } from './user.model';
import { UserService } from './user.service';

@Controller()
@UseInterceptors(ClassSerializerInterceptor) // Exclude fields in entity
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AdminGuard)
  @Get('/admin/ambassadors')
  async ambassadors() {
    return this.userService.find({ where: { is_anbassador: true } });
  }

  @UseGuards(AmbassadorGuard)
  @Get('ambassador/rankings')
  async rankings() {
    /* Using the `find` method from the `UserService` to find all the ambassadors. */
    const ambassadors: User[] = await this.userService.find({
      is_ambassador: true,
      relations: ['orders', 'orders.order_items'],
    });

    return ambassadors.map((ambassador) => {
      return {
        name: ambassador.last_name,
        revenue: ambassador.revenue,
      };
    });
  }
}
