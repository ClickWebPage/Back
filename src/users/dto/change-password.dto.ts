import { IsString, MinLength, Matches } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&.,\-_:])[A-Za-z\d@$!%*?&.,\-_:]{6,}$/, {
    message:
      'La contraseña debe incluir al menos una letra, un número y un carácter especial (@$!%*?&.,-_:)',
  })
  nuevaPassword: string;
}
