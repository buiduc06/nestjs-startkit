import { IsNotEmpty, IsEmail, IsString, IsOptional } from 'class-validator';

export class InfoUpdate {
  @IsOptional()
  @IsString()
  first_name: string;

  @IsOptional()
  @IsString()
  last_name: string;
}
