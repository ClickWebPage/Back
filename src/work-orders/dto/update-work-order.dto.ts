import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkOrderDto } from './create-work-order.dto';
import {
  IsOptional,
  IsEnum,
  IsNumber,
  IsString,
  IsDateString,
} from 'class-validator';
import { WorkOrderStatus } from '@prisma/client';

export class UpdateWorkOrderDto extends PartialType(CreateWorkOrderDto) {
  @IsOptional()
  @IsEnum(WorkOrderStatus)
  estado?: WorkOrderStatus;

  @IsOptional()
  @IsNumber()
  costo_final?: number;

  @IsOptional()
  @IsString()
  notas_tecnicas?: string;

  @IsOptional()
  @IsDateString()
  fecha_entrega?: string;
}
