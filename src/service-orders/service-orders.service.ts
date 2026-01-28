import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceOrderDto } from './dto/create-service-order.dto';
import { UpdateServiceOrderStatusDto } from './dto/update-service-order-status.dto';
import { Prisma, ServiceOrder } from '@prisma/client';

@Injectable()
export class ServiceOrdersService {
  constructor(
    private readonly prisma: PrismaService, // ✅ tipado correcto
  ) {}

  async create(
    userId: number,
    dto: CreateServiceOrderDto,
  ): Promise<ServiceOrder> {
    if (dto.productId) {
      const product = await this.prisma.product.findUnique({
        where: { id: dto.productId },
      });
      if (!product) {
        throw new NotFoundException('Producto no encontrado');
      }
    }

    return this.prisma.serviceOrder.create({
      data: {
        userId,
        productId: dto.productId,
        descripcion_problema: dto.descripcion_problema,
        estado_equipo: dto.estado_equipo,
        numero_serie: dto.numero_serie,
      },
    });
  }

  private readonly baseInclude = { product: true } as const;

  async findUserServiceOrders(
    userId: number,
  ): Promise<Prisma.ServiceOrderGetPayload<{ include: { product: true } }>[]> {
    return this.prisma.serviceOrder.findMany({
      where: { userId },
      include: this.baseInclude,
      orderBy: { fecha_creacion: 'desc' },
    });
  }

  async findOneForUser(
    id: number,
    userId: number,
  ): Promise<
    Prisma.ServiceOrderGetPayload<{ include: { product: true; user: true } }>
  > {
    const order = await this.prisma.serviceOrder.findUnique({
      where: { id },
      include: { product: true, user: true },
    });

    if (!order) {
      throw new NotFoundException('Orden de servicio no encontrada');
    }

    if (order.userId !== userId) {
      throw new ForbiddenException('No tienes acceso a esta orden de servicio');
    }

    return order;
  }

  async updateStatus(
    id: number,
    dto: UpdateServiceOrderStatusDto,
  ): Promise<ServiceOrder> {
    const order = await this.prisma.serviceOrder.findUnique({ where: { id } });

    if (!order) {
      throw new NotFoundException('Orden de servicio no encontrada');
    }

    return this.prisma.serviceOrder.update({
      where: { id },
      data: { estado: dto.estado },
    });
  }
}
