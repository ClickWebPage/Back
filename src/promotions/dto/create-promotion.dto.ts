import { IsInt, IsNumber, IsDateString, IsBoolean, IsOptional, Min, Max } from 'class-validator';

export class CreatePromotionDto {
  @IsInt()
  producto_id: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  porcentaje_descuento: number;

  @IsDateString()
  fecha_inicio: string;

  @IsDateString()
  fecha_fin: string;

  @IsBoolean()
  @IsOptional()
  activa?: boolean;
}
