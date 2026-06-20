import { IsString, IsInt, IsBoolean, IsOptional, Min, MaxLength } from 'class-validator';

export class CreateGarantiaDto {
  @IsString()
  @MaxLength(100)
  marca: string;

  @IsInt()
  @Min(0)
  meses: number;

  @IsString()
  @MaxLength(500)
  mensaje: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
