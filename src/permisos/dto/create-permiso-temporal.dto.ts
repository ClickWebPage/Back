import { IsInt, IsString, IsDateString, IsBoolean, IsOptional, IsIn } from 'class-validator';

export class CreatePermisoTemporalDto {
  @IsInt({ message: 'El user_id debe ser un número entero' })
  user_id: number;

  @IsString()
  @IsIn(['banners', 'promociones', 'logo', 'all'], {
    message: 'El tipo de permiso debe ser: banners, promociones, logo o all',
  })
  tipo_permiso: string;

  @IsDateString({}, { message: 'La fecha de expiración debe ser una fecha válida' })
  fecha_expiracion: string;

  @IsOptional()
  @IsString()
  razon?: string;
}
