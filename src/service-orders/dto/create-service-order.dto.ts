import {
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateServiceOrderDto {
  @IsOptional()
  @IsInt()
  @IsPositive()
  productId?: number;

  @IsString()
  @MaxLength(1000)
  descripcion_problema: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  estado_equipo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  numero_serie?: string;
}
