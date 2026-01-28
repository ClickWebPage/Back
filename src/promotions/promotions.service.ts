import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';

@Injectable()
export class PromotionsService {
  constructor(private prisma: PrismaService) {}

  async create(createPromotionDto: CreatePromotionDto) {
    const { producto_id, fecha_inicio, fecha_fin, ...rest } = createPromotionDto;

    // Validar que el producto existe
    const producto = await this.prisma.product.findUnique({
      where: { id: producto_id },
    });

    if (!producto) {
      throw new NotFoundException(`Producto con ID ${producto_id} no encontrado`);
    }

    // Validar fechas
    const inicio = new Date(fecha_inicio);
    const fin = new Date(fecha_fin);

    if (inicio >= fin) {
      throw new BadRequestException('La fecha de inicio debe ser anterior a la fecha de fin');
    }

    // Verificar que no haya promociones activas para este producto en el mismo período
    const promocionesConflicto = await this.prisma.promotion.findMany({
      where: {
        producto_id,
        activa: true,
        OR: [
          {
            AND: [
              { fecha_inicio: { lte: fin } },
              { fecha_fin: { gte: inicio } },
            ],
          },
        ],
      },
    });

    if (promocionesConflicto.length > 0) {
      throw new BadRequestException('Ya existe una promoción activa para este producto en el período especificado');
    }

    return this.prisma.promotion.create({
      data: {
        ...rest,
        producto_id,
        fecha_inicio: inicio,
        fecha_fin: fin,
      },
      include: {
        producto: {
          select: {
            id: true,
            nombre_producto: true,
            precio: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.promotion.findMany({
      include: {
        producto: {
          select: {
            id: true,
            nombre_producto: true,
            precio: true,
            imagen_url: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findActive() {
    const ahora = new Date();
    return this.prisma.promotion.findMany({
      where: {
        activa: true,
        fecha_inicio: { lte: ahora },
        fecha_fin: { gte: ahora },
      },
      include: {
        producto: {
          select: {
            id: true,
            nombre_producto: true,
            precio: true,
            imagen_url: true,
            descripcion: true,
            productImages: {
              select: {
                id: true,
                ruta_imagen: true,
                es_principal: true,
                orden: true,
              },
              orderBy: {
                orden: 'asc',
              },
            },
          },
        },
      },
    });
  }

  async findByProduct(productoId: number) {
    const ahora = new Date();
    return this.prisma.promotion.findFirst({
      where: {
        producto_id: productoId,
        activa: true,
        fecha_inicio: { lte: ahora },
        fecha_fin: { gte: ahora },
      },
    });
  }

  async findOne(id: number) {
    const promotion = await this.prisma.promotion.findUnique({
      where: { id },
      include: {
        producto: {
          select: {
            id: true,
            nombre_producto: true,
            precio: true,
            imagen_url: true,
          },
        },
      },
    });

    if (!promotion) {
      throw new NotFoundException(`Promoción con ID ${id} no encontrada`);
    }

    return promotion;
  }

  async update(id: number, updatePromotionDto: UpdatePromotionDto) {
    await this.findOne(id); // Verificar que existe

    const { fecha_inicio, fecha_fin, ...rest } = updatePromotionDto;

    const data: any = { ...rest };

    if (fecha_inicio) {
      data.fecha_inicio = new Date(fecha_inicio);
    }

    if (fecha_fin) {
      data.fecha_fin = new Date(fecha_fin);
    }

    // Validar fechas si ambas están presentes
    if (data.fecha_inicio && data.fecha_fin && data.fecha_inicio >= data.fecha_fin) {
      throw new BadRequestException('La fecha de inicio debe ser anterior a la fecha de fin');
    }

    return this.prisma.promotion.update({
      where: { id },
      data,
      include: {
        producto: {
          select: {
            id: true,
            nombre_producto: true,
            precio: true,
          },
        },
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id); // Verificar que existe
    return this.prisma.promotion.delete({
      where: { id },
    });
  }

  async deactivateExpired() {
    const ahora = new Date();
    return this.prisma.promotion.updateMany({
      where: {
        activa: true,
        fecha_fin: { lt: ahora },
      },
      data: {
        activa: false,
      },
    });
  }
}
