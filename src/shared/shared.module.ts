import { CacheModule, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import * as redisStore from 'cache-manager-redis-store';
import { RedisService } from './redis.service';
import type { ClientOpts } from 'redis';
import { LoggerService } from './logger.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    JwtModule.register({
      secret: 'secret',
      signOptions: { expiresIn: '1d' },
    }),
    CacheModule.registerAsync<ClientOpts>({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('REDIS_HOST'),
        port: configService.get('REDIS_PORT'),
      }),
    }),
  ],
  providers: [RedisService, LoggerService, ConfigService],
  exports: [JwtModule, CacheModule, RedisService, LoggerService],
})
export class SharedModule {}
