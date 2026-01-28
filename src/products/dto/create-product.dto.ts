import { IsString, IsNumber, IsOptional, IsInt, Min, IsBoolean } from 'class-validator';

export class CreateProductDto {
  @IsString()
  nombre_producto: string;

  @IsString()
  descripcion: string;

  @IsNumber()
  @Min(0)
  precio: number;

  @IsInt()
  @Min(0)
  stock: number;

  @IsString()
  @IsOptional()
  imagen_url?: string;

  @IsString()
  @IsOptional()
  marca?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @IsOptional()
  categoria?: string;

  @IsString()
  @IsOptional()
  subcategoria?: string;

  @IsString()
  @IsOptional()
  modelo?: string;

  @IsString()
  @IsOptional()
  sku?: string;

  @IsString()
  @IsOptional()
  especificaciones?: string;

  @IsString()
  @IsOptional()
  garantia?: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;

  @IsBoolean()
  @IsOptional()
  destacado?: boolean;

  @IsString()
  @IsOptional()
  erpId?: string;
}
