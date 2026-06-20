import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { FilterAuditLogDto } from './dto/filter-audit-log.dto';

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Registra una acción de auditoría. No lanza excepción para no interrumpir
   * el flujo principal en caso de fallo al guardar el log.
   */
  async log(dto: CreateAuditLogDto): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          usuario_id:       dto.usuario_id      ?? null,
          usuario_nombre:   dto.usuario_nombre,
          usuario_username: dto.usuario_username,
          usuario_rol:      dto.usuario_rol,
          accion:           dto.accion,
          modulo:           dto.modulo,
          descripcion:      dto.descripcion,
          detalle:          dto.detalle        ?? undefined,
          ip_address:       dto.ip_address     ?? null,
          user_agent:       dto.user_agent     ?? null,
          exitoso:          dto.exitoso         ?? true,
          error_detalle:    dto.error_detalle  ?? null,
        },
      });
      this.logger.log(`[AUDIT OK] ${dto.modulo}/${dto.accion} — ${dto.usuario_username}`);
    } catch (err) {
      // Solo loguear en consola para no romper el flujo principal
      this.logger.error(
        `[AUDIT ERROR] No se pudo guardar el log: ${err?.message ?? err}`,
        err?.stack,
      );
      this.logger.error(`[AUDIT ERROR] DTO recibido: ${JSON.stringify(dto)}`);
    }
  }

  /**
   * Retorna logs paginados con filtros opcionales.
   */
  async findAll(filters: FilterAuditLogDto) {
    const page  = Math.max(1, parseInt(filters.page  ?? '1',  10));
    const limit = Math.min(200, Math.max(1, parseInt(filters.limit ?? '50', 10)));
    const skip  = (page - 1) * limit;

    const where: any = {};

    if (filters.modulo)           where.modulo           = { contains: filters.modulo,           mode: 'insensitive' };
    if (filters.accion)           where.accion           = { contains: filters.accion,           mode: 'insensitive' };
    if (filters.usuario_username) where.usuario_username = { contains: filters.usuario_username, mode: 'insensitive' };

    if (filters.desde || filters.hasta) {
      where.fecha = {};
      if (filters.desde) where.fecha.gte = new Date(filters.desde);
      if (filters.hasta) where.fecha.lte = new Date(filters.hasta);
    }

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { fecha: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Retorna estadísticas rápidas para mostrar en el dashboard del log.
   */
  async getStats() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const [totalHoy, totalSemana, porModulo, porAccion, ultimosUsuarios] = await Promise.all([
      this.prisma.auditLog.count({ where: { fecha: { gte: hoy } } }),
      this.prisma.auditLog.count({ where: { fecha: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
      this.prisma.auditLog.groupBy({ by: ['modulo'],  _count: { id: true }, orderBy: { _count: { id: 'desc' } }, take: 10 }),
      this.prisma.auditLog.groupBy({ by: ['accion'],  _count: { id: true }, orderBy: { _count: { id: 'desc' } } }),
      this.prisma.auditLog.findMany({
        select: { usuario_username: true, usuario_nombre: true, usuario_rol: true, fecha: true, modulo: true, accion: true, descripcion: true },
        orderBy: { fecha: 'desc' },
        take: 5,
        distinct: ['usuario_username'],
      }),
    ]);

    return { totalHoy, totalSemana, porModulo, porAccion, ultimosUsuarios };
  }
}
