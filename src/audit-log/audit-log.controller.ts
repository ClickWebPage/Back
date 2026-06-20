import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuditLogService } from './audit-log.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { FilterAuditLogDto } from './dto/filter-audit-log.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/roles.enum';

@Controller('audit-log')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.VENDEDOR)
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  /**
   * POST /audit-log
   * El frontend llama a este endpoint después de cada acción del admin/vendedor.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateAuditLogDto, @Req() req: Request) {
    const user = req.user as any;

    // Enriquecer con datos del usuario autenticado si no vienen en el body
    const enriched: CreateAuditLogDto = {
      ...dto,
      usuario_id:       dto.usuario_id       ?? user?.id,
      usuario_nombre:   dto.usuario_nombre   ?? `${user?.nombre ?? ''} ${user?.apellido ?? ''}`.trim(),
      usuario_username: dto.usuario_username ?? user?.username ?? 'desconocido',
      usuario_rol:      dto.usuario_rol      ?? user?.rol      ?? 'desconocido',
      ip_address:       dto.ip_address       ?? (req.headers['x-forwarded-for'] as string ?? req.socket.remoteAddress),
      user_agent:       dto.user_agent       ?? req.headers['user-agent'],
    };

    await this.auditLogService.log(enriched);
    return { ok: true };
  }

  /**
   * GET /audit-log
   * Devuelve historial paginado con filtros opcionales.
   * Solo administradores pueden consultar.
   */
  @Get()
  @Roles(Role.ADMIN)
  findAll(@Query() filters: FilterAuditLogDto) {
    return this.auditLogService.findAll(filters);
  }

  /**
   * GET /audit-log/stats
   * Estadísticas rápidas para mostrar en el panel.
   */
  @Get('stats')
  @Roles(Role.ADMIN)
  getStats() {
    return this.auditLogService.getStats();
  }

  /**
   * POST /audit-log/test
   * Endpoint de diagnóstico: inserta un log de prueba directamente.
   * Solo admins. Eliminar una vez confirmado el funcionamiento.
   */
  @Post('test')
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.ADMIN)
  async testInsert(@Req() req: Request) {
    const user = req.user as any;
    await this.auditLogService.log({
      usuario_id:       user?.userId ?? null,
      usuario_nombre:   'TEST',
      usuario_username: user?.username ?? 'test',
      usuario_rol:      user?.rol      ?? 'administrador',
      accion:           'OTHER',
      modulo:           'diagnostico',
      descripcion:      'Log de prueba desde endpoint /audit-log/test',
      exitoso:          true,
    });
    return { ok: true, message: 'Log de prueba insertado. Revisa los logs del servidor y la tabla audit_logs.' };
  }
}
