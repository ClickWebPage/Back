import { IsBoolean, IsOptional, IsDateString } from 'class-validator';

export class UpdatePermisoTemporalDto {
  @IsOptional()
  @IsDateString({}, { message: 'La fecha de expiración debe ser una fecha válida' })
  fecha_expiracion?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @IsOptional()
  razon?: string;
}
