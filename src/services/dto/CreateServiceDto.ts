import { IsString, IsInt, IsOptional, IsArray } from 'class-validator';
export class CreateServiceDto {
  @IsString()
  title: string;

  @IsInt()
  price: number;

  @IsString()
  time: string;

  @IsOptional()
  @IsInt()
  categoryId: number;
}
