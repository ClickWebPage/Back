import { IsEnum, IsString, IsNotEmpty, IsOptional, IsInt, IsArray } from 'class-validator';

export enum NotificationType {
  NUEVO_PEDIDO = 'NUEVO_PEDIDO',
  PEDIDO_ACTUALIZADO = 'PEDIDO_ACTUALIZADO',
  PEDIDO_CANCELADO = 'PEDIDO_CANCELADO',
  PEDIDO_COMPLETADO = 'PEDIDO_COMPLETADO',
  NUEVO_USUARIO = 'NUEVO_USUARIO',
}

export class CreateNotificationDto {
  @IsEnum(NotificationType)
  @IsNotEmpty()
  tipo: NotificationType;

  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsString()
  @IsNotEmpty()
  mensaje: string;

  @IsInt()
  @IsOptional()
  orderId?: number;

  @IsString()
  @IsOptional()
  orderCodigo?: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  destinatarios: string[]; // ['admin', 'vendedor']
}
