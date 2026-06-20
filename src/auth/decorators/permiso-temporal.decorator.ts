import { SetMetadata } from '@nestjs/common';

export const PERMISO_TEMPORAL_KEY = 'permiso_temporal';

/**
 * Decorador para indicar qué tipo de permiso temporal se requiere.
 * Usado por PermisoTemporalGuard: permite acceso si el usuario es ADMIN
 * o si tiene un permisoTemporal activo del tipo indicado.
 */
export const RequierePermiso = (tipo: string) =>
  SetMetadata(PERMISO_TEMPORAL_KEY, tipo);
