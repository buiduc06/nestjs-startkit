import { IsNotEmpty, IsString } from 'class-validator';

type product = {
  product_id: number[];
  quantity: number;
};

export default class CreateOrderDto {
  code: string;
  first_name: string;
  last_name: string;
  email: string;
  address: string;
  country: string;
  city: string;
  zip: string;
  products: product[];
}
