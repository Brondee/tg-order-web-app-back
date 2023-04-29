import { IsString, IsBoolean, IsNumber } from 'class-validator';

export class CreateDateDto {
  @IsString()
  date: string;

  @IsBoolean()
  isWorkingDate: boolean;

  @IsNumber()
  specialistId: number;
}
