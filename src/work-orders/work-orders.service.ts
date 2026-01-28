import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { UpdateWorkOrderDto } from './dto/update-work-order.dto';
import { WorkOrderStatus } from '@prisma/client';

@Injectable()
export class WorkOrdersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Genera un tracking ID único para la orden de trabajo
   */
  private async generateTrackingId(): Promise<string> {
    const prefix = 'WO';
    let trackingId = '';
    let exists = true;

    while (exists) {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      trackingId = `${prefix}-${randomNum}`;
      const existing = await this.prisma.workOrder.findUnique({
        where: { trackingId },
      });
      exists = !!existing;
    }

    return trackingId;
  }

  /**
   * Crear una nueva orden de trabajo
   */
  async create(createWorkOrderDto: CreateWorkOrderDto, userId?: number) {
    const trackingId = await this.generateTrackingId();

    return this.prisma.workOrder.create({
      data: {
        trackingId,
        ...createWorkOrderDto,
        userId: createWorkOrderDto.userId || userId,
      },
      include: {
        user: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            telefono: true,
          },
        },
      },
    });
  }

  /**
   * Obtener todas las órdenes de trabajo con filtros opcionales
   */
  async findAll(filters?: {
    estado?: WorkOrderStatus;
    tecnico_id?: number;
    disponibles?: boolean;
  }) {
    const where: {
      estado?: WorkOrderStatus;
      tecnico_id?: number | null;
    } = {};

    if (filters?.estado) {
      where.estado = filters.estado;
    }

    if (filters?.tecnico_id) {
      where.tecnico_id = filters.tecnico_id;
    }

    if (filters?.disponibles) {
      where.tecnico_id = null;
    }

    return this.prisma.workOrder.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            telefono: true,
          },
        },
      },
      orderBy: {
        fecha_creacion: 'desc',
      },
    });
  }

  /**
   * Obtener una orden de trabajo por ID
   */
  async findOne(id: number) {
    const workOrder = await this.prisma.workOrder.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            telefono: true,
          },
        },
      },
    });

    if (!workOrder) {
      throw new NotFoundException(
        `Orden de trabajo con ID ${id} no encontrada`,
      );
    }

    return workOrder;
  }

  /**
   * Obtener una orden de trabajo por tracking ID
   */
  async findByTrackingId(trackingId: string) {
    const workOrder = await this.prisma.workOrder.findUnique({
      where: { trackingId },
      include: {
        user: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            telefono: true,
          },
        },
      },
    });

    if (!workOrder) {
      throw new NotFoundException(
        `Orden de trabajo con código ${trackingId} no encontrada`,
      );
    }

    return workOrder;
  }

  /**
   * Actualizar una orden de trabajo
   */
  async update(
    id: number,
    updateWorkOrderDto: UpdateWorkOrderDto,
    userId?: number,
    userRole?: string,
  ) {
    const workOrder = await this.findOne(id);

    // Solo el técnico asignado o un admin pueden actualizar
    if (
      userRole !== 'administrador' &&
      workOrder.tecnico_id &&
      workOrder.tecnico_id !== userId
    ) {
      throw new ForbiddenException(
        'No tienes permiso para actualizar esta orden',
      );
    }

    return this.prisma.workOrder.update({
      where: { id },
      data: updateWorkOrderDto,
      include: {
        user: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            telefono: true,
          },
        },
      },
    });
  }

  /**
   * Asignar un técnico a una orden de trabajo
   */
  async assignTechnician(
    id: number,
    tecnicoId: number,
    tecnicoNombre: string,
    userRole?: string,
  ) {
    const workOrder = await this.findOne(id);

    if (workOrder.tecnico_id && userRole !== 'administrador') {
      throw new BadRequestException('Esta orden ya tiene un técnico asignado');
    }

    return this.prisma.workOrder.update({
      where: { id },
      data: {
        tecnico_id: tecnicoId,
        tecnico_nombre: tecnicoNombre,
      },
      include: {
        user: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            telefono: true,
          },
        },
      },
    });
  }

  /**
   * Desasignar un técnico de una orden de trabajo
   */
  async unassignTechnician(id: number, userId: number, userRole: string) {
    const workOrder = await this.findOne(id);

    // Solo el técnico asignado o un admin pueden desasignar
    if (userRole !== 'administrador' && workOrder.tecnico_id !== userId) {
      throw new ForbiddenException(
        'No tienes permiso para desasignar esta orden',
      );
    }

    return this.prisma.workOrder.update({
      where: { id },
      data: {
        tecnico_id: null,
        tecnico_nombre: null,
      },
      include: {
        user: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            telefono: true,
          },
        },
      },
    });
  }

  /**
   * Actualizar el estado de una orden de trabajo
   */
  async updateStatus(
    id: number,
    estado: WorkOrderStatus,
    userId?: number,
    userRole?: string,
  ) {
    const workOrder = await this.findOne(id);

    // Solo el técnico asignado o un admin pueden cambiar el estado
    if (
      userRole !== 'administrador' &&
      workOrder.tecnico_id &&
      workOrder.tecnico_id !== userId
    ) {
      throw new ForbiddenException(
        'No tienes permiso para actualizar el estado de esta orden',
      );
    }

    const updateData: {
      estado: WorkOrderStatus;
      fecha_entrega?: Date;
    } = { estado };

    // Si el estado es ENTREGADO, actualizar fecha de entrega
    if (estado === WorkOrderStatus.ENTREGADO) {
      updateData.fecha_entrega = new Date();
    }

    return this.prisma.workOrder.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            telefono: true,
          },
        },
      },
    });
  }

  /**
   * Eliminar una orden de trabajo (soft delete cambiando estado a CANCELADO)
   */
  async remove(id: number, userId: number, userRole: string) {
    await this.findOne(id);

    // Solo administradores pueden eliminar órdenes
    if (userRole !== 'administrador') {
      throw new ForbiddenException('No tienes permiso para eliminar órdenes');
    }

    return this.prisma.workOrder.update({
      where: { id },
      data: {
        estado: WorkOrderStatus.CANCELADO,
      },
    });
  }

  /**
   * Obtener estadísticas de órdenes de trabajo
   */
  async getStatistics(tecnicoId?: number) {
    const where: { tecnico_id?: number } = tecnicoId
      ? { tecnico_id: tecnicoId }
      : {};

    const [
      total,
      enEspera,
      enRevision,
      reparados,
      entregados,
      sinReparacion,
      cancelados,
    ] = await Promise.all([
      this.prisma.workOrder.count({ where }),
      this.prisma.workOrder.count({
        where: { ...where, estado: WorkOrderStatus.EN_ESPERA },
      }),
      this.prisma.workOrder.count({
        where: { ...where, estado: WorkOrderStatus.EN_REVISION },
      }),
      this.prisma.workOrder.count({
        where: { ...where, estado: WorkOrderStatus.REPARADO },
      }),
      this.prisma.workOrder.count({
        where: { ...where, estado: WorkOrderStatus.ENTREGADO },
      }),
      this.prisma.workOrder.count({
        where: { ...where, estado: WorkOrderStatus.SIN_REPARACION },
      }),
      this.prisma.workOrder.count({
        where: { ...where, estado: WorkOrderStatus.CANCELADO },
      }),
    ]);

    const disponibles = tecnicoId
      ? 0
      : await this.prisma.workOrder.count({ where: { tecnico_id: null } });

    return {
      total,
      enEspera,
      enRevision,
      reparados,
      entregados,
      sinReparacion,
      cancelados,
      disponibles,
    };
  }
}
