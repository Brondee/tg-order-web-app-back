import { IsInt, IsBoolean, IsOptional, IsString } from 'class-validator';

export class EditDateDto {
  @IsString()
  date: string;

  @IsInt()
  specialistId: number;

  @IsOptional()
  @IsBoolean()
  isWorkingDate: boolean;

  @IsOptional()
  @IsBoolean()
  isWorkingDateChanged: boolean;
}
