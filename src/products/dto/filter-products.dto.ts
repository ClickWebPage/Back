import { IsIn, IsNumber, IsOptional, IsString, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class FilterProductsDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;

  @IsOptional()
  @IsString()
  marca?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  categoria?: string;

  @IsOptional()
  @IsString()
  subcategoria?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  destacado?: boolean;

  @IsOptional()
  @IsString()
  search?: string;

  // Rangos predefinidos de precio:
  //  - "low":   menor a 100
  //  - "mid":   de 101 a 399
  //  - "high":  desde 400 en adelante
  @IsOptional()
  @IsIn(['low', 'mid', 'high'])
  priceRange?: 'low' | 'mid' | 'high';
}
