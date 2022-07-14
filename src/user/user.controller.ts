import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { UserService } from './user.service';

@Controller()
@UseInterceptors(ClassSerializerInterceptor) // Exclude fields in entity
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard)
  @Get('/admin/ambassadors')
  async ambassadors() {
    return this.userService.find({ where: { is_anbassador: true } });
  }
}
