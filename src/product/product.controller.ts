import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ProductCreateDto } from './dtos/product-create.dto';
import { ProductService } from './product.service';

@Controller()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get('admin/products')
  async all() {
    return this.productService.find({});
  }

  @Post('admin/products')
  async create(@Body() body: ProductCreateDto) {
    return this.productService.save(body);
  }

  @Get('admin/products/:id')
  async get(@Param('id') id: number) {
    const product = await this.productService.findOne({ where: { id: id } });

    if (!product) {
      throw new BadRequestException('Product not exists');
    }

    return product;
  }

  @Put('admin/products/:id')
  async update(@Body() body: ProductCreateDto, @Param('id') id: number) {
    const product = await this.productService.findOne({ where: { id: id } });

    if (!product) {
      throw new BadRequestException(`Product ${id} not exits`);
    }

    await this.productService.update(id, body);

    return {
      message: 'Update product success',
    };
  }

  @Delete('admin/products/:id')
  async delete(@Param('id') id: number) {
    await this.productService.delete(id);

    return {
      message: 'Delete success',
    };
  }
}
