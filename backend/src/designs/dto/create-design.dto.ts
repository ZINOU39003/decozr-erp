import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDesignDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsString()
  name_ar: string;

  @IsOptional()
  @IsString()
  description_ar?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  category_id?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsIn(['draft', 'private', 'public', 'archived'])
  library_status?: string;

  @IsOptional()
  @IsString()
  visibility?: string;

  @IsOptional()
  @IsString()
  sell_policy?: string;

  @IsOptional()
  @IsString()
  owner_type?: string;

  @IsOptional()
  @IsString()
  image_url?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  gallery_images?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  retail_price?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  wholesale_price?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  cost_price?: number;
}
