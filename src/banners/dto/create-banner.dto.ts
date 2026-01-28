import { IsString, IsNotEmpty, IsOptional, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBannerDto {
  @ApiProperty({ description: 'Título del banner' })
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @ApiProperty({ description: 'URL de la imagen del banner' })
  @IsString()
  @IsNotEmpty()
  imagen_url: string;

  @ApiPropertyOptional({ description: 'ID del producto asociado (opcional)' })
  @IsOptional()
  @IsInt()
  producto_id?: number;
}
