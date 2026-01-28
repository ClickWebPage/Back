import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class UpdateEstadoGestionDto {
  @IsNotEmpty()
  @IsString()
  @IsIn(['PENDIENTE', 'EN_TRAMITE', 'ATENDIDO', 'CANCELADO'])
  estado_gestion: 'PENDIENTE' | 'EN_TRAMITE' | 'ATENDIDO' | 'CANCELADO';
}
