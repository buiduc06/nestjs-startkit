import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { RedisService } from '../shared/redis.service';
import { AdminGuard } from '../auth/admin.guard';
import { AmbassadorGuard } from '../auth/ambassador.guard';
import { User } from './user.model';
import { UserService } from './user.service';
import { Response } from 'express';

@Controller()
@UseInterceptors(ClassSerializerInterceptor) // Exclude fields in entity
export class UserController {
  constructor(
    private readonly userService: UserService,
    private redisService: RedisService,
  ) {}

  @UseGuards(AdminGuard)
  @Get('/admin/ambassadors')
  async ambassadors() {
    return this.userService.find({ where: { is_anbassador: true } });
  }

  @UseGuards(AmbassadorGuard)
  @Get('ambassador/rankings')
  /**
   * It gets the client from the Redis service, then it calls the zrevrangebyscore function on the
   * client, which returns the rankings
   */
  async rankings(@Res() response: Response) {
    const client = this.redisService.getClient();
    client.zrevrangebyscore(
      'rankings',
      '+inf',
      '-inf',
      'withscores',
      (err, result) => {
        let score;

        response.send(
          result.reduce((o, r) => {
            if (isNaN(parseInt(r))) {
              return {
                ...o,
                [r]: score,
              };
            } else {
              score = parseInt(r);
              return o;
            }
          }, {}),
        );
      },
    );
  }
}
