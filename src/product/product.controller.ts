import {
  BadRequestException,
  Body,
  CacheInterceptor,
  CacheKey,
  CacheTTL,
  CACHE_MANAGER,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cache } from 'cache-manager';
import { Request } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';
import { ProductCreateDto } from './dtos/product-create.dto';
import { Product } from './product';
import { ProductService } from './product.service';

@Controller()
@UseInterceptors(ClassSerializerInterceptor)
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private eventEmitter: EventEmitter2,
  ) {}

  @UseGuards(AuthGuard)
  @Get('admin/products')
  async all() {
    return this.productService.find({});
  }

  @UseGuards(AuthGuard)
  @Post('admin/products')
  /**
   * It creates a new product, emits an event, and returns the product
   * @param {ProductCreateDto} body - ProductCreateDto - The body parameter is a decorator that tells
   * Nest to get the body of the request and pass it to the method. The ProductCreateDto is a class that
   * we'll create in the next step.
   * @returns The product that was created.
   */
  async create(@Body() body: ProductCreateDto) {
    const product = this.productService.save(body);
    this.eventEmitter.emit('product.created', product);

    return product;
  }

  @UseGuards(AuthGuard)
  @Get('admin/products/:id')
  async get(@Param('id') id: number) {
    const product = await this.productService.findOne({ where: { id: id } });

    if (!product) {
      throw new BadRequestException('Product not exists');
    }

    return product;
  }

  @UseGuards(AuthGuard)
  @Put('admin/products/:id')
  async update(@Body() body: ProductCreateDto, @Param('id') id: number) {
    const product = await this.productService.findOne({ where: { id: id } });

    if (!product) {
      throw new BadRequestException(`Product ${id} not exits`);
    }

    await this.productService.update(id, body);
    this.eventEmitter.emit('product.updated', id);

    return {
      message: 'Update product success',
    };
  }

  @UseGuards(AuthGuard)
  @Delete('admin/products/:id')
  async delete(@Param('id') id: number) {
    await this.productService.delete(id);
    this.eventEmitter.emit('product.deleted', id);

    return {
      message: 'Delete success',
    };
  }

  @CacheKey('products_frontend')
  @CacheTTL(30 * 60)
  @UseInterceptors(CacheInterceptor)
  @Get('ambassador/products/frontend')
  async frontend() {
    return this.productService.find({});
  }

  @Get('ambassador/products/backend')
  async backend(@Req() request: Request) {
    let products = await this.cacheManager.get<Product[]>('products_backend');

    /* It checks if the products are in the cache. If they are not, it gets them from the database and
    saves them in the cache. */
    if (!products) {
      products = await this.productService.find({});
      await this.cacheManager.set('products_backend', products, { ttl: 1800 });
    }

    /* Filtering the products by title or description. */
    if (request.query.s) {
      const s = request.query.s.toString().toLowerCase();
      products = products.filter(
        (p) =>
          p.title.toLowerCase().indexOf(s) >= 0 ||
          p.description.toLowerCase().indexOf(s) >= 0,
      );
    }

    /* Sorting the products by price. */
    if (request.query.sort === 'asc' || request.query.sort === 'desc') {
      products.sort((a, b) => {
        const diff = a.price - b.price;
        if (diff === 0) return 0;

        const sign = Math.abs(diff) / diff; //-1,1

        return request.query.sort === 'asc' ? sign : -sign;
      });
    }

    /* Paginating the products. */
    const page: number = parseInt(request.query.page as any) || 1;
    const perPage = 9;
    const total = products.length;
    const data = products.slice((page - 1) * perPage, page * perPage);

    return {
      data,
      total,
      page,
      last_page: Math.ceil(total / perPage),
    };
  }
}
