import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Banner } from '@prisma/client';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

@Injectable()
export class BannersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Obtiene todos los banners con información del producto relacionado
   */
  async findAll(): Promise<Banner[]> {
    return await this.prisma.banner.findMany({
      include: {
        producto: {
          select: {
            id: true,
            nombre_producto: true,
            precio: true,
            stock: true,
          },
        },
      },
    });
  }

  /**
   * Obtiene un banner por su ID
   */
  async findOne(id: number): Promise<Banner> {
    const banner = await this.prisma.banner.findUnique({
      where: { id },
      include: {
        producto: {
          select: {
            id: true,
            nombre_producto: true,
            precio: true,
            stock: true,
          },
        },
      },
    });

    if (!banner) {
      throw new NotFoundException(`Banner con ID ${id} no encontrado`);
    }

    return banner;
  }

  /**
   * Crea un nuevo banner
   */
  async create(createBannerDto: CreateBannerDto): Promise<Banner> {
    return await this.prisma.banner.create({
      data: {
        titulo: createBannerDto.titulo,
        imagen_url: createBannerDto.imagen_url,
        producto_id: createBannerDto.producto_id || null,
      },
      include: {
        producto: {
          select: {
            id: true,
            nombre_producto: true,
            precio: true,
            stock: true,
          },
        },
      },
    });
  }

  /**
   * Actualiza un banner existente
   */
  async update(id: number, updateBannerDto: UpdateBannerDto): Promise<Banner> {
    // Verificar que el banner existe
    await this.findOne(id);

    return await this.prisma.banner.update({
      where: { id },
      data: {
        ...(updateBannerDto.titulo && { titulo: updateBannerDto.titulo }),
        ...(updateBannerDto.imagen_url && { imagen_url: updateBannerDto.imagen_url }),
        ...(updateBannerDto.producto_id !== undefined && { 
          producto_id: updateBannerDto.producto_id 
        }),
      },
      include: {
        producto: {
          select: {
            id: true,
            nombre_producto: true,
            precio: true,
            stock: true,
          },
        },
      },
    });
  }

  /**
   * Elimina un banner
   */
  async remove(id: number): Promise<void> {
    // Verificar que el banner existe
    await this.findOne(id);

    await this.prisma.banner.delete({
      where: { id },
    });
  }
}
