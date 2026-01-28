import {
  IsString,
  IsOptional,
  IsEmail,
  IsNumber,
  IsEnum,
} from 'class-validator';
import { WorkOrderStatus } from '@prisma/client';

export class CreateWorkOrderDto {
  @IsString()
  cliente_nombre: string;

  @IsString()
  cliente_telefono: string;

  @IsOptional()
  @IsEmail()
  cliente_email?: string;

  @IsString()
  marca_equipo: string;

  @IsString()
  modelo_equipo: string;

  @IsOptional()
  @IsString()
  numero_serie?: string;

  @IsString()
  descripcion_problema: string;

  @IsOptional()
  @IsString()
  notas_tecnicas?: string;

  @IsOptional()
  @IsEnum(WorkOrderStatus)
  estado?: WorkOrderStatus;

  @IsOptional()
  @IsNumber()
  costo_estimado?: number;

  @IsOptional()
  @IsNumber()
  userId?: number;
}
