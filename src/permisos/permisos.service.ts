import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePermisoTemporalDto } from './dto/create-permiso-temporal.dto';
import { UpdatePermisoTemporalDto } from './dto/update-permiso-temporal.dto';

@Injectable()
export class PermisosService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreatePermisoTemporalDto, otorgadoPor: string) {
    // Verificar que el usuario existe
    const usuario = await this.prisma.user.findUnique({
      where: { id: createDto.user_id },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Verificar que el usuario sea vendedor
    if (usuario.rol !== 'vendedor') {
      throw new BadRequestException('Solo se pueden otorgar permisos temporales a vendedores');
    }

    // Verificar que la fecha de expiración sea futura
    const fechaExpiracion = new Date(createDto.fecha_expiracion);
    if (fechaExpiracion <= new Date()) {
      throw new BadRequestException('La fecha de expiración debe ser futura');
    }

    return await this.prisma.permisoTemporal.create({
      data: {
        user_id: createDto.user_id,
        tipo_permiso: createDto.tipo_permiso,
        fecha_expiracion: fechaExpiracion,
        razon: createDto.razon,
        otorgado_por: otorgadoPor,
        activo: true,
      },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            username: true,
            email: true,
          },
        },
      },
    });
  }

  async findAll() {
    return await this.prisma.permisoTemporal.findMany({
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            username: true,
            email: true,
            rol: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByUserId(userId: number) {
    return await this.prisma.permisoTemporal.findMany({
      where: { user_id: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findActiveByUserId(userId: number) {
    const now = new Date();
    return await this.prisma.permisoTemporal.findMany({
      where: {
        user_id: userId,
        activo: true,
        fecha_expiracion: {
          gte: now,
        },
      },
    });
  }

  async verificarPermiso(userId: number, tipoPermiso: string): Promise<boolean> {
    const now = new Date();
    const permisos = await this.prisma.permisoTemporal.findMany({
      where: {
        user_id: userId,
        activo: true,
        fecha_expiracion: {
          gte: now,
        },
        OR: [
          { tipo_permiso: tipoPermiso },
          { tipo_permiso: 'all' },
        ],
      },
    });

    return permisos.length > 0;
  }

  async update(id: number, updateDto: UpdatePermisoTemporalDto) {
    const permiso = await this.prisma.permisoTemporal.findUnique({
      where: { id },
    });

    if (!permiso) {
      throw new NotFoundException('Permiso no encontrado');
    }

    // Si se actualiza la fecha de expiración, verificar que sea futura
    if (updateDto.fecha_expiracion) {
      const fechaExpiracion = new Date(updateDto.fecha_expiracion);
      if (fechaExpiracion <= new Date()) {
        throw new BadRequestException('La fecha de expiración debe ser futura');
      }
    }

    return await this.prisma.permisoTemporal.update({
      where: { id },
      data: {
        ...updateDto,
        fecha_expiracion: updateDto.fecha_expiracion
          ? new Date(updateDto.fecha_expiracion)
          : undefined,
      },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            username: true,
            email: true,
          },
        },
      },
    });
  }

  async revocar(id: number) {
    const permiso = await this.prisma.permisoTemporal.findUnique({
      where: { id },
    });

    if (!permiso) {
      throw new NotFoundException('Permiso no encontrado');
    }

    return await this.prisma.permisoTemporal.update({
      where: { id },
      data: { activo: false },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            username: true,
            email: true,
          },
        },
      },
    });
  }

  async delete(id: number) {
    const permiso = await this.prisma.permisoTemporal.findUnique({
      where: { id },
    });

    if (!permiso) {
      throw new NotFoundException('Permiso no encontrado');
    }

    await this.prisma.permisoTemporal.delete({
      where: { id },
    });
  }

  // Tarea programada para desactivar permisos expirados
  async desactivarPermisosExpirados() {
    const now = new Date();
    await this.prisma.permisoTemporal.updateMany({
      where: {
        activo: true,
        fecha_expiracion: {
          lt: now,
        },
      },
      data: {
        activo: false,
      },
    });
  }
}
