import { Module } from '@nestjs/common';
import { BannersController } from './banners.controller';
import { BannersService } from './banners.service';
import { PermisoTemporalGuard } from '../auth/guards/permiso-temporal.guard';

@Module({
  controllers: [BannersController],
  providers: [BannersService, PermisoTemporalGuard],
})
export class BannersModule {}
