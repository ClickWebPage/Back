import { Controller, Get, Post, Query, Body, UseGuards, Req } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/roles.enum';
import type { Request } from 'express';

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

  // =========================================
  // Endpoints para Visitas
  // =========================================

  @Get('visitas/overview')
  async getVisitorsOverview(
    @Query('periodo') periodo: string = '30dias',
    @Query('excluirRoles') excluirRoles?: string,
    @Query('soloRoles') soloRoles?: string,
  ) {
    const excluirArr = excluirRoles ? excluirRoles.split(',').map(r => r.trim()).filter(Boolean) : undefined;
    const soloArr = soloRoles ? soloRoles.split(',').map(r => r.trim()).filter(Boolean) : undefined;
    return this.analyticsService.getVisitorsOverview(periodo, excluirArr, soloArr);
  }

  @Get('visitas/paginas')
  async getPageViewsStats(
    @Query('periodo') periodo: string = '30dias',
    @Query('excluirRoles') excluirRoles?: string,
    @Query('soloRoles') soloRoles?: string,
  ) {
    const excluirArr = excluirRoles ? excluirRoles.split(',').map(r => r.trim()).filter(Boolean) : undefined;
    const soloArr = soloRoles ? soloRoles.split(',').map(r => r.trim()).filter(Boolean) : undefined;
    return this.analyticsService.getPageViewsStats(periodo, excluirArr, soloArr);
  }

  @Get('visitas/productos')
  async getProductViewsStats(
    @Query('periodo') periodo: string = '30dias',
    @Query('limite') limite: string = '20',
    @Query('excluirRoles') excluirRoles?: string,
    @Query('soloRoles') soloRoles?: string,
  ) {
    const excluirArr = excluirRoles ? excluirRoles.split(',').map(r => r.trim()).filter(Boolean) : undefined;
    const soloArr = soloRoles ? soloRoles.split(',').map(r => r.trim()).filter(Boolean) : undefined;
    return this.analyticsService.getProductViewsStats(periodo, parseInt(limite), excluirArr, soloArr);
  }

  @Get('visitas/marcas')
  async getBrandViewsStats(
    @Query('periodo') periodo: string = '30dias',
    @Query('limite') limite: string = '20',
    @Query('excluirRoles') excluirRoles?: string,
    @Query('soloRoles') soloRoles?: string,
  ) {
    const excluirArr = excluirRoles ? excluirRoles.split(',').map(r => r.trim()).filter(Boolean) : undefined;
    const soloArr = soloRoles ? soloRoles.split(',').map(r => r.trim()).filter(Boolean) : undefined;
    return this.analyticsService.getBrandViewsStats(periodo, parseInt(limite), excluirArr, soloArr);
  }
}

// Controller separado para tracking público (sin autenticación requerida)
@Controller('analytics/track')
export class AnalyticsTrackingController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('page')
  async trackPageView(@Body() body: any, @Req() req: Request) {
    const data = {
      ruta: body.ruta,
      ip_address: req.ip || req.headers['x-forwarded-for'] as string || 'unknown',
      user_agent: req.headers['user-agent'],
      referrer: body.referrer,
      session_id: body.session_id,
      usuario_id: body.usuario_id,
    };
    return this.analyticsService.trackPageView(data);
  }

  @Post('product')
  async trackProductView(@Body() body: any, @Req() req: Request) {
    const data = {
      producto_id: body.producto_id,
      producto_nombre: body.producto_nombre,
      marca: body.marca,
      ip_address: req.ip || req.headers['x-forwarded-for'] as string || 'unknown',
      user_agent: req.headers['user-agent'],
      session_id: body.session_id,
      usuario_id: body.usuario_id,
    };
    return this.analyticsService.trackProductView(data);
  }

  @Post('brand')
  async trackBrandView(@Body() body: any, @Req() req: Request) {
    const data = {
      marca: body.marca,
      ip_address: req.ip || req.headers['x-forwarded-for'] as string || 'unknown',
      user_agent: req.headers['user-agent'],
      session_id: body.session_id,
      usuario_id: body.usuario_id,
    };
    return this.analyticsService.trackBrandView(data);
  }
}
