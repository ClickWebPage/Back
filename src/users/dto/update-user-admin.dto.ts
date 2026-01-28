import {
  IsString,
  IsEmail,
  IsOptional,
  Length,
  Matches,
  IsEnum,
} from 'class-validator';
import { Role } from '../../auth/roles.enum';

export class UpdateUserAdminDto {
  @IsOptional()
  @IsString()
  @Length(2, 50, { message: 'El nombre debe tener entre 2 y 50 caracteres' })
  nombre?: string;

  @IsOptional()
  @IsString()
  @Length(2, 50, { message: 'El apellido debe tener entre 2 y 50 caracteres' })
  apellido?: string;

  @IsOptional()
  @IsString()
  @Length(3, 30, { message: 'El username debe tener entre 3 y 30 caracteres' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'El username solo puede contener letras, números y guiones bajos',
  })
  username?: string;

  @IsOptional()
  @IsEmail({}, { message: 'El email no es válido' })
  email?: string;

  @IsOptional()
  @IsString()
  @Length(10, 20, {
    message: 'El teléfono debe tener entre 10 y 20 caracteres',
  })
  @Matches(/^[0-9+\-\s()]+$/, {
    message:
      'El teléfono solo puede contener números y caracteres: + - ( ) espacio',
  })
  telefono?: string;

  @IsOptional()
  @IsString()
  @Length(10, 200, {
    message: 'La dirección debe tener entre 10 y 200 caracteres',
  })
  direccion?: string;

  @IsOptional()
  @IsEnum(Role, {
    message: 'El rol debe ser: administrador, tecnico o vendedor',
  })
  rol?: Role;
}
