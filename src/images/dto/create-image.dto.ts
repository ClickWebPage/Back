import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateImageDto {
  @IsInt()
  @Type(() => Number)
  producto_id: number;

  @IsString()
  @IsNotEmpty()
  ruta_imagen: string;

  @IsOptional()
  @IsString()
  nombre_archivo?: string;

  @IsOptional()
  @IsString()
  tipo_archivo?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  tamano_archivo?: number;

  @IsOptional()
  @IsBoolean()
  es_principal?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  orden?: number;

  @IsOptional()
  @IsBoolean()
  version_optimizada?: boolean;
}

