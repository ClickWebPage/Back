import { IsNotEmpty, IsString } from 'class-validator';

export class AssignOrderDto {
  @IsNotEmpty()
  @IsString()
  vendedor_nombre: string;
}
