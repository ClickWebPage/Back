import { IsString, IsEmail, MinLength, MaxLength, Matches, IsOptional, Length } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'El nombre no puede exceder 50 caracteres' })
  nombre: string;

  @IsString()
  @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'El apellido no puede exceder 50 caracteres' })
  apellido: string;

  @IsString()
  @MinLength(3, { message: 'El nombre de usuario debe tener al menos 3 caracteres' })
  @MaxLength(80, { message: 'El nombre de usuario no puede exceder 80 caracteres' })
  @Matches(/^[a-zA-Z0-9_.-]+$/, {
    message: 'El nombre de usuario solo puede contener letras, números, guiones, puntos y guiones bajos',
  })
  username: string;

  @IsEmail({}, { message: 'Debe proporcionar un correo electrónico válido' })
  @MaxLength(100, { message: 'El correo no puede exceder 100 caracteres' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&.,\-_:])[A-Za-z\d@$!%*?&.,\-_:]{6,}$/, {
    message:
      'La contraseña debe incluir al menos una letra, un número y un carácter especial (@$!%*?&.,-_:)',
  })
  password: string;

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
