import { IsString, IsOptional, Length, Matches } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @Length(10, 20, { message: 'El teléfono debe tener entre 10 y 20 caracteres' })
  @Matches(/^[0-9+\-\s()]+$/, {
    message: 'El teléfono solo puede contener números y caracteres: + - ( ) espacio',
  })
  telefono?: string;

  @IsOptional()
  @IsString()
  @Length(10, 200, { message: 'La dirección debe tener entre 10 y 200 caracteres' })
  direccion?: string;
}
