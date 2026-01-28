import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/roles.enum';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('kpis')
  async getKPIs() {
    return this.analyticsService.getKPIs();
  }

  @Get('ventas/por-periodo')
  async getVentasPorPeriodo(@Query('periodo') periodo: string = '30dias') {
    return this.analyticsService.getVentasPorPeriodo(periodo);
  }

  @Get('productos/top')
  async getProductosTop(@Query('limite') limite: string = '10') {
    return this.analyticsService.getProductosTop(parseInt(limite));
  }

  @Get('ventas/por-categoria')
  async getVentasPorCategoria() {
    return this.analyticsService.getVentasPorCategoria();
  }

  @Get('ordenes/recientes')
  async getOrdenesRecientes(@Query('limite') limite: string = '10') {
    return this.analyticsService.getOrdenesRecientes(parseInt(limite));
  }
}
