import { Module } from '@nestjs/common';
import { GarantiasService } from './garantias.service';
import { GarantiasController } from './garantias.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GarantiasController],
  providers: [GarantiasService],
  exports: [GarantiasService],
})
export class GarantiasModule {}
