import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { PERMISO_TEMPORAL_KEY } from '../decorators/permiso-temporal.decorator';
import { Role } from '../roles.enum';

/**
 * Guard que permite acceso si el usuario:
 * - Es ADMIN (pasa siempre), o
 * - Es VENDEDOR con un permisoTemporal activo y no expirado
 *   para el tipo indicado por @RequierePermiso().
 *
 * Debe usarse junto con JwtAuthGuard.
 */
@Injectable()
export class PermisoTemporalGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermiso = this.reflector.getAllAndOverride<string>(
      PERMISO_TEMPORAL_KEY,
      [context.getHandler(), context.getClass()],
    );

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('Acceso denegado: Usuario no autenticado');
    }

    // Los administradores siempre tienen acceso
    if (user.rol === Role.ADMIN) {
      return true;
    }

    // Si no hay permiso requerido definido, solo dejar pasar admins
    if (!requiredPermiso) {
      throw new ForbiddenException(
        'Acceso denegado: No tiene permisos suficientes',
      );
    }

    // Para vendedores, verificar permiso temporal activo
    if (user.rol === Role.VENDEDOR) {
      const now = new Date();
      const permiso = await this.prisma.permisoTemporal.findFirst({
        where: {
          user_id: user.userId,
          activo: true,
          fecha_expiracion: { gte: now },
          OR: [
            { tipo_permiso: requiredPermiso },
            { tipo_permiso: 'all' },
          ],
        },
      });

      if (permiso) {
        return true;
      }
    }

    throw new ForbiddenException(
      'Acceso denegado: No tiene permisos suficientes',
    );
  }
}
