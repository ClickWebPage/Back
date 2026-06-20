import { IsOptional, IsString, IsNumberString, IsDateString } from 'class-validator';

export class FilterAuditLogDto {
  /** Filtrar por módulo (productos, banners, etc.) */
  @IsOptional()
  @IsString()
  modulo?: string;

  /** Filtrar por tipo de acción (CREATE, UPDATE, DELETE...) */
  @IsOptional()
  @IsString()
  accion?: string;

  /** Filtrar por username del usuario */
  @IsOptional()
  @IsString()
  usuario_username?: string;

  /** Fecha inicio (ISO) */
  @IsOptional()
  @IsDateString()
  desde?: string;

  /** Fecha fin (ISO) */
  @IsOptional()
  @IsDateString()
  hasta?: string;

  /** Página (por defecto 1) */
  @IsOptional()
  @IsNumberString()
  page?: string;

  /** Registros por página (por defecto 50) */
  @IsOptional()
  @IsNumberString()
  limit?: string;
}
