import {
  IsArray,
  ValidateNested,
  IsInt,
  Min,
  IsOptional,
  IsString,
  IsEmail,
} from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemInputDto {
  @IsInt()
  productId: number;

  @IsInt()
  @Min(1)
  cantidad: number;
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemInputDto)
  items: OrderItemInputDto[];

  @IsString()
  paymentMethod: 'CASH' | 'CARD' | 'TRANSFER';

  @IsOptional()
  @IsString()
  paymentRef?: string;

  @IsString()
  nombre_cliente: string;

  @IsEmail()
  email_cliente: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsString()
  direccion_envio: string;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  descuento?: number;
}
