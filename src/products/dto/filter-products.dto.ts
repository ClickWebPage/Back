import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class FilterProductsDto {
  @IsOptional()
  @IsString()
  marca?: string;

  @IsOptional()
  @IsString()
  bodega?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  categoria?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minCosto?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxCosto?: number;

  @IsOptional()
  @Transform(({ value }) => value ? parseInt(value, 10) : 1)
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @Transform(({ value }) => value ? parseInt(value, 10) : undefined)
  @IsNumber()
  @Min(1)
  limit?: number;
}
