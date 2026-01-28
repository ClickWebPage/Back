import { IsEnum, IsNotEmpty } from 'class-validator';
import { WorkOrderStatus } from '@prisma/client';

export class UpdateStatusDto {
  @IsEnum(WorkOrderStatus)
  @IsNotEmpty()
  estado: WorkOrderStatus;
}
