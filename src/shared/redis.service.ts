import { CACHE_MANAGER, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { RedisClient } from 'redis';
import Redis from 'redis';
import { Store } from 'cache-manager';

interface RedisCache extends Cache {
  store: RedisStore;
}

interface RedisStore extends Store {
  name: 'redis';
  getClient: () => Redis.RedisClient;
  isCacheableValue: (value: any) => boolean;
}

export class RedisService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: RedisCache) {}

  async getClient(): Promise<RedisClient> {
    const store = this.cacheManager.store;

    return store.getClient();
  }
}
