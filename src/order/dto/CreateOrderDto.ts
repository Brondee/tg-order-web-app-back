import { IsInt, IsString } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  clientName: string;

  @IsString()
  clientTelephone: string;

  @IsString()
  clientComment: string;

  @IsString()
  masterName: string;

  @IsString()
  dateTime: string;

  @IsString()
  servicesInfo: string;

  @IsInt()
  totalPrice: number;

  @IsInt()
  servicesCount: number;
}
