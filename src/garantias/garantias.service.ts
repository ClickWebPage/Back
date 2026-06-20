import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGarantiaDto } from './dto/create-garantia.dto';
import { UpdateGarantiaDto } from './dto/update-garantia.dto';

@Injectable()
export class GarantiasService {
  constructor(private prisma: PrismaService) {}

  async create(createGarantiaDto: CreateGarantiaDto) {
    // Verificar si ya existe una garantía para esta marca
    const existente = await this.prisma.garantiaMarca.findUnique({
      where: { marca: createGarantiaDto.marca },
    });

    if (existente) {
      throw new ConflictException(`Ya existe una garantía configurada para la marca ${createGarantiaDto.marca}`);
    }

    return this.prisma.garantiaMarca.create({
      data: createGarantiaDto,
    });
  }

  async findAll() {
    return this.prisma.garantiaMarca.findMany({
      orderBy: { marca: 'asc' },
    });
  }

  async findAllActive() {
    return this.prisma.garantiaMarca.findMany({
      where: { activo: true },
      orderBy: { marca: 'asc' },
    });
  }

  async findOne(id: number) {
    const garantia = await this.prisma.garantiaMarca.findUnique({
      where: { id },
    });

    if (!garantia) {
      throw new NotFoundException(`Garantía con ID ${id} no encontrada`);
    }

    return garantia;
  }

  async findByMarca(marca: string) {
    const garantia = await this.prisma.garantiaMarca.findUnique({
      where: { marca },
    });

    return garantia;
  }

  async update(id: number, updateGarantiaDto: UpdateGarantiaDto) {
    // Verificar que existe
    await this.findOne(id);

    // Si se está cambiando la marca, verificar que no exista otra con ese nombre
    if (updateGarantiaDto.marca) {
      const existente = await this.prisma.garantiaMarca.findFirst({
        where: {
          marca: updateGarantiaDto.marca,
          NOT: { id },
        },
      });

      if (existente) {
        throw new ConflictException(`Ya existe una garantía configurada para la marca ${updateGarantiaDto.marca}`);
      }
    }

    return this.prisma.garantiaMarca.update({
      where: { id },
      data: updateGarantiaDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.garantiaMarca.delete({
      where: { id },
    });
  }

  // Obtener todas las marcas únicas de productos para sugerencias
  async getMarcasProductos() {
    const productos = await this.prisma.product.findMany({
      select: { marca: true },
      distinct: ['marca'],
      where: {
        marca: { not: null },
      },
      orderBy: { marca: 'asc' },
    });

    return productos.map(p => p.marca).filter(Boolean);
  }
}
