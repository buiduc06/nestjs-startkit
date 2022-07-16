import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Cache } from 'cache-manager';
import { Product } from '../product';

@Injectable()
export class ProductListener {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  @OnEvent('product.created')
  handleProductCreatedEvent(product: Product) {
    this.cacheManager.del('products_backend');
    this.cacheManager.del('products_frontend');
    console.log(`dispatch product.created`);
  }

  @OnEvent('product.updated')
  handleProductUpdatedEvent(product_id: number) {
    this.cacheManager.del('products_backend');
    this.cacheManager.del('products_frontend');
    console.log(`dispatch product.updated event - product id: ${product_id}`);
  }

  @OnEvent('product.deleted')
  handleProductDeletedEvent(product_id: number) {
    this.cacheManager.del('products_backend');
    this.cacheManager.del('products_frontend');
    console.log(`dispatch product.deleted event - product id: ${product_id}`);
  }
}
