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
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { AuthGuard } from 'src/auth/auth.guard';
import { ProductCreateDto } from './dtos/product-create.dto';
import { ProductService } from './product.service';

@Controller()
@UseInterceptors(ClassSerializerInterceptor)
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @UseGuards(AuthGuard)
  @Get('admin/products')
  async all() {
    return this.productService.find({});
  }

  @UseGuards(AuthGuard)
  @Post('admin/products')
  async create(@Body() body: ProductCreateDto) {
    this.cacheManager.del('products_frontend');
    this.cacheManager.del('products_backend');

    return this.productService.save(body);
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
    this.cacheManager.del('products_frontend');
    this.cacheManager.del('products_backend');

    return {
      message: 'Update product success',
    };
  }

  @UseGuards(AuthGuard)
  @Delete('admin/products/:id')
  async delete(@Param('id') id: number) {
    await this.productService.delete(id);
    this.cacheManager.del('products_frontend');
    this.cacheManager.del('products_backend');

    return {
      message: 'Delete success',
    };
  }

  // option 2
  @CacheKey('products_frontend')
  @CacheTTL(30 * 60)
  @UseInterceptors(CacheInterceptor)
  @Get('ambassador/products/frontend')
  async frontend() {
    return this.productService.find({});
  }

  // option 1
  @Get('ambassador/products/backend')
  async backend() {
    let products = await this.cacheManager.get('products_backend');

    if (!products) {
      products = await this.productService.find({});
      await this.cacheManager.set('products_backend', products, { ttl: 1800 });
    }
    return products;
  }
}
