import { IsString, IsNotEmpty } from 'class-validator';

export class AssignWorkOrderDto {
  @IsString()
  @IsNotEmpty()
  tecnico_nombre: string;
}
