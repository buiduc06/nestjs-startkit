import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { faker } from '@faker-js/faker';
import { ProductService } from '../product/product.service';
import { randomInt } from 'crypto';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const productService = app.get(ProductService);

  for (let i = 0; i < 30; i++) {
    await productService.save({
      title: faker.lorem.word(2),
      description: faker.lorem.word(10),
      image: faker.image.imageUrl(200, 200, '', true),
      price: randomInt(10, 100),
    });
  }
  process.exit();
}
bootstrap();
