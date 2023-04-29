import { IsOptional, IsString, IsArray, IsInt } from 'class-validator';
export class EditSpecialistDto {
  @IsInt()
  id: number;

  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  photoUrl: string;

  @IsOptional()
  @IsString()
  qualification: string;

  @IsOptional()
  @IsArray()
  categoryIds: number[];
}
