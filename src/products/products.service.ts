import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Product } from '@prisma/client';
import { FilterProductsDto } from './dto/filter-products.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Helper para agregar imagen_url a los productos
   */
  private addImagenUrl(productos: any[]): any[] {
    return productos.map(producto => {
      let imagen_url = '/Productos/placeholder-product.png';
      
      if (producto.productImages && producto.productImages.length > 0) {
        // Buscar imagen principal o usar la primera
        const imagenPrincipal = producto.productImages.find(img => img.es_principal);
        imagen_url = imagenPrincipal 
          ? imagenPrincipal.ruta_imagen 
          : producto.productImages[0].ruta_imagen;
      }
      
      return {
        ...producto,
        imagen_url,
      };
    });
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    // Si no se proporciona imagen_url, usar una por defecto
    const data = {
      ...createProductDto,
      imagen_url: createProductDto.imagen_url || '/Productos/placeholder-product.png'
    };
    
    return this.prisma.product.create({
      data,
    });
  }

  async findAll(filters: FilterProductsDto): Promise<Product[]> {
    const { minPrice, maxPrice, marca, color, categoria, subcategoria, destacado, search, priceRange } = filters;

    const where: Prisma.ProductWhereInput = {
      activo: true, // Solo mostrar productos activos
    };

    // Determinar rango de precio según priceRange o min/max explícitos
    let effectiveMin = minPrice;
    let effectiveMax = maxPrice;

    if (priceRange === 'low') {
      // Menor a 100
      effectiveMin = undefined;
      effectiveMax = 100;
    } else if (priceRange === 'mid') {
      // De 101 a 399
      effectiveMin = 101;
      effectiveMax = 399;
    } else if (priceRange === 'high') {
      // Desde 400 en adelante
      effectiveMin = 400;
      effectiveMax = undefined;
    }

    if (effectiveMin !== undefined || effectiveMax !== undefined) {
      where.precio = {};
      if (effectiveMin !== undefined) {
        where.precio.gte = effectiveMin;
      }
      if (effectiveMax !== undefined) {
        where.precio.lte = effectiveMax;
      }
    }

    if (marca) {
      where.marca = {
        contains: marca,
        mode: 'insensitive',
      };
    }

    if (color) {
      where.color = {
        contains: color,
        mode: 'insensitive',
      };
    }

    if (categoria) {
      where.categoria = {
        contains: categoria,
        mode: 'insensitive',
      };
    }

    if (subcategoria) {
      where.subcategoria = {
        contains: subcategoria,
        mode: 'insensitive',
      };
    }

    if (destacado !== undefined) {
      where.destacado = destacado;
    }

    if (search) {
      where.OR = [
        {
          nombre_producto: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          descripcion: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          marca: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          categoria: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          modelo: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    const productos = await this.prisma.product.findMany({ 
      where,
      orderBy: [
        { destacado: 'desc' }, // Productos destacados primero
        { fecha_creacion: 'desc' }, // Luego por fecha de creación
      ],
      include: {
        productImages: {
          orderBy: [
            { es_principal: 'desc' },
            { orden: 'asc' },
          ],
        },
      },
    });

    return this.addImagenUrl(productos);
  }

  async findOne(id: number): Promise<Product | null> {
    const producto = await this.prisma.product.findUnique({
      where: { 
        id,
      },
      include: {
        productImages: {
          orderBy: [
            { es_principal: 'desc' },
            { orden: 'asc' },
          ],
        },
      },
    });

    if (!producto) return null;

    // Agregar imagen_url
    const productosConImagen = this.addImagenUrl([producto]);
    return productosConImagen[0];
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    // Verificar que el producto existe
    const producto = await this.prisma.product.findUnique({ where: { id } });
    if (!producto) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    return await this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });
  }

  async remove(id: number): Promise<Product> {
    // Verificar que el producto existe
    const producto = await this.prisma.product.findUnique({ where: { id } });
    if (!producto) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    // Soft delete: marcar como inactivo en lugar de eliminar
    return await this.prisma.product.update({
      where: { id },
      data: { activo: false },
    });
  }
}
