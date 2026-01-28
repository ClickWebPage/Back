import { IsString } from 'class-validator';

export class UpdateSiteConfigDto {
  @IsString()
  clave: string;

  @IsString()
  valor: string;
}
