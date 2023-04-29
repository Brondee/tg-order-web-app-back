import { IsOptional, IsString, IsArray } from 'class-validator';
export class CreateSpecialistDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  photoUrl: string;

  @IsString()
  qualification: string;

  @IsOptional()
  @IsArray()
  categoryIds: number[];
}
