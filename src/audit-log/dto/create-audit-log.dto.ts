import { IsString, IsOptional, IsBoolean, IsInt, IsObject } from 'class-validator';

export class CreateAuditLogDto {
  @IsOptional()
  @IsInt()
  usuario_id?: number;

  @IsString()
  usuario_nombre: string;

  @IsString()
  usuario_username: string;

  @IsString()
  usuario_rol: string;

  /** CREATE | UPDATE | DELETE | UPLOAD | OTHER */
  @IsString()
  accion: string;

  /** productos | promociones | banners | logo | usuarios | permisos | garantias | personalizacion | video */
  @IsString()
  modulo: string;

  @IsString()
  descripcion: string;

  @IsOptional()
  @IsObject()
  detalle?: Record<string, any>;

  @IsOptional()
  @IsString()
  ip_address?: string;

  @IsOptional()
  @IsString()
  user_agent?: string;

  @IsOptional()
  @IsBoolean()
  exitoso?: boolean;

  @IsOptional()
  @IsString()
  error_detalle?: string;
}
