import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';

@Controller()
@UseInterceptors(ClassSerializerInterceptor) // Exclude fields in entity
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/admin/ambassadors')
  async ambassadors() {
    return this.userService.find({ where: { is_anbassador: true } });
  }
}
