import { IsString, IsOptional, IsBoolean, IsInt } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  name_ar: string;

  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  parent_id?: string;

  @IsOptional()
  @IsInt()
  sort_order?: number;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
