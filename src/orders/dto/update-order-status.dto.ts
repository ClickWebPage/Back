import { IsString } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsString()
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';
}
