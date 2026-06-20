import { PartialType } from '@nestjs/mapped-types';
import { CreateGarantiaDto } from './create-garantia.dto';

export class UpdateGarantiaDto extends PartialType(CreateGarantiaDto) {}
