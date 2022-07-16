import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  NotFoundException,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { RegisterDto } from './dtos/register.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { AmbassadorGuard } from './ambassador.guard';
import { LoginDto } from './dtos/login.dto';
import { PasswordChangeDto } from './dtos/password-change.dto';
import { InfoUpdate } from './dtos/info-update.dto';

@Controller()
@UseInterceptors(ClassSerializerInterceptor) // Exclude fields in entity
export class AmbassadorController {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}
  @Post('ambassador/register')
  async register(@Body() body: RegisterDto) {
    const { password_confirm, ...data } = body;

    const user = await this.userService.findOne({
      where: { email: data['email'] },
    });

    if (user) {
      throw new BadRequestException('user already exists');
    }

    const hashed = await bcrypt.hash(body.password, 12);

    return this.userService.save({
      ...data,
      password: hashed,
      is_anbassador: true,
    });
  }

  @Post('ambassador/login')
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { email, password } = body;

    const user = await this.userService.findOne({
      where: { email: email, is_anbassador: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!(await bcrypt.compare(password, user.password))) {
      throw new BadRequestException('Invalid crendentials');
    }

    const jwt = await this.jwtService.signAsync({
      id: user.id,
      scope: 'ambassador', //ambassador
    });

    response.cookie('jwt', jwt, { httpOnly: true });

    return {
      message: 'success',
    };
  }

  @Get('ambassador/user')
  @UseGuards(AmbassadorGuard)
  async user(@Req() request: Request) {
    const id = await this.getUserIdRequest(request);

    const user = await this.userService.findOne({
      where: { id: id, is_anbassador: true },
    });

    return user;
  }

  @UseGuards(AmbassadorGuard)
  @Post('ambassador/logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('jwt');

    return {
      message: 'success',
    };
  }

  @UseGuards(AmbassadorGuard)
  @Put('ambassador/users/info')
  async updateInfo(@Req() request: Request, @Body() body: InfoUpdate) {
    const id = await this.getUserIdRequest(request);

    await this.userService.update(id, body);

    return await this.userService.findOne({
      where: { id: id, is_anbassador: true },
    });
  }

  @UseGuards(AmbassadorGuard)
  @Put('ambassador/users/password')
  async updatePasword(
    @Req() request: Request,
    @Body() body: PasswordChangeDto,
  ) {
    const { password, current_password } = body;

    const id = await this.getUserIdRequest(request);

    const user = await this.userService.findOne({
      where: { id: id, is_anbassador: true },
    });

    // compare current password in database
    if (!(await bcrypt.compare(current_password, user.password))) {
      throw new BadRequestException('current_password not match');
    }

    // update password to database
    await this.userService.update(id, {
      password: await bcrypt.hash(password, 12),
    });

    return {
      message: 'update password success',
    };
  }

  private async getUserIdRequest(request: Request) {
    const cookie = request.cookies['jwt'];

    const { id } = await this.jwtService.verifyAsync(cookie);

    return id;
  }
}
