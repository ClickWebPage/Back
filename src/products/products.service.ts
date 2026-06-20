import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Product } from '@prisma/client';
import { FilterProductsDto } from './dto/filter-products.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { determineProductCategory } from './config/product-categories.config';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Helper para agregar imagen_url, precioA y categoria a los productos
   */
  private addImagenUrlAndPrecio(productos: any[]): any[] {
    return productos.map(producto => {
      let imagen_url = '/placeholder_product.jpg';
      
      if (producto.productImages && producto.productImages.length > 0) {
        // Buscar imagen principal o usar la primera
        const imagenPrincipal = producto.productImages.find(img => img.es_principal);
        imagen_url = imagenPrincipal 
          ? imagenPrincipal.ruta_imagen 
          : producto.productImages[0].ruta_imagen;
      }
      
      // Obtener precioA de la relación precioUnitario
      const precioA = producto.precioUnitario?.precioA ?? null;
      
      // Usar la columna linea de PrecioUnitario como categoría del producto.
      // Si no tiene linea asignada, se cae al keyword matching como respaldo.
      const linea = producto.precioUnitario?.linea ?? null;
      const categoria = linea
        ? linea.trim()
        : determineProductCategory(producto.producto);
      
      return {
        ...producto,
        imagen_url,
        precioA,
        categoria,
        // Mantener costoTotal como respaldo si no hay precioA
        costoTotal: precioA ?? producto.costoTotal,
      };
    });
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    return this.prisma.product.create({
      data: createProductDto,
    });
  }

  async findAll(filters: FilterProductsDto): Promise<{ data: Product[]; total: number; page: number; limit: number; totalPages: number }> {
    try {
      console.log('=== PRODUCTS findAll - START ===');
      console.log('Filters:', JSON.stringify(filters));
      
      const { minCosto, maxCosto, marca, bodega, search, categoria, page = 1, limit } = filters;

      const where: Prisma.ProductWhereInput = {
        // Filtrar productos que tengan stock > 0
        // existenciaTotal es string, así que filtramos los que NO sean "0" ni vacíos ni null
        NOT: [
          { existenciaTotal: '0' },
          { existenciaTotal: '' },
          { existenciaTotal: null },
        ],
        // Filtrar productos que tengan precio > 0
        // Solo mostrar productos que tengan precioUnitario con precioA mayor a 0
        precioUnitario: {
          precioA: {
            gt: 0,
          },
        },
      };

      // Filtro por rango de costo
      if (minCosto !== undefined || maxCosto !== undefined) {
        where.costoTotal = {};
        if (minCosto !== undefined) {
          where.costoTotal.gte = minCosto;
        }
        if (maxCosto !== undefined) {
          where.costoTotal.lte = maxCosto;
        }
      }

      if (marca) {
        where.marca = {
          contains: marca,
          mode: Prisma.QueryMode.insensitive,
        };
      }

      if (bodega) {
        where.bodega = {
          contains: bodega,
          mode: Prisma.QueryMode.insensitive,
        };
      }

      if (search) {
        where.OR = [
          {
            producto: {
              contains: search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          {
            marca: {
              contains: search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          {
            medida: {
              contains: search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          {
            bodega: {
              contains: search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          {
            codigo: !isNaN(Number(search)) ? Number(search) : undefined,
          },
        ].filter(condition => {
          // Filtrar condiciones con undefined
          if ('codigo' in condition && condition.codigo === undefined) {
            return false;
          }
          return true;
        });
      }

      console.log('WHERE clause:', JSON.stringify(where));

      // Contar total de productos
      const total = await this.prisma.product.count({ where });

      // Si no hay limit, devolver todos los productos (para compatibilidad)
      const queryOptions: any = {
        where,
        orderBy: [
          { codigo: 'asc' },
        ],
        include: {
          productImages: {
            orderBy: [
              { es_principal: 'desc' },
              { orden: 'asc' },
            ],
          },
          precioUnitario: true, // Incluir precio unitario para obtener precioA
        },
      };

      // Aplicar paginación solo si se especifica limit
      if (limit) {
        queryOptions.skip = (page - 1) * limit;
        queryOptions.take = limit;
      }

      const productos = await this.prisma.product.findMany(queryOptions);

      console.log(`Found ${productos.length} products (total: ${total})`);
      let result = this.addImagenUrlAndPrecio(productos);
      
      // Filtrar por categoría si se especifica (filtro post-procesado)
      if (categoria) {
        result = result.filter(producto => 
          producto.categoria.toLowerCase() === categoria.toLowerCase()
        );
        console.log(`After category filter: ${result.length} products`);
      }
      
      console.log('=== PRODUCTS findAll - END ===');
      
      // Recalcular total después del filtro de categoría
      const finalTotal = categoria ? result.length : total;
      const totalPages = limit ? Math.ceil(finalTotal / limit) : 1;
      
      return {
        data: result,
        total: finalTotal,
        page: Number(page),
        limit: limit || finalTotal,
        totalPages,
      };
    
    } catch (error) {
      console.error('=== ERROR in findAll ===');
      console.error('Error details:', error);
      console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
      throw new Error(`Error al obtener productos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Método para admin - devuelve TODOS los productos sin filtros de stock/precio
   */
  async findAllAdmin(filters: FilterProductsDto): Promise<{ data: Product[]; total: number; page: number; limit: number; totalPages: number }> {
    const { marca, bodega, search, categoria, page = 1, limit } = filters;

    const where: Prisma.ProductWhereInput = {};

    if (marca) {
      where.marca = {
        contains: marca,
        mode: Prisma.QueryMode.insensitive,
      };
    }

    if (bodega) {
      where.bodega = {
        contains: bodega,
        mode: Prisma.QueryMode.insensitive,
      };
    }

    if (search) {
      where.OR = [
        { producto: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { marca: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { medida: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { bodega: { contains: search, mode: Prisma.QueryMode.insensitive } },
        !isNaN(Number(search)) ? { codigo: Number(search) } : {},
      ].filter(c => Object.keys(c).length > 0);
    }

    const total = await this.prisma.product.count({ where });

    const queryOptions: any = {
      where,
      orderBy: [{ codigo: 'asc' }],
      include: {
        productImages: {
          orderBy: [{ es_principal: 'desc' }, { orden: 'asc' }],
        },
        precioUnitario: true,
      },
    };

    if (limit) {
      queryOptions.skip = (page - 1) * limit;
      queryOptions.take = limit;
    }

    const productos = await this.prisma.product.findMany(queryOptions);
    let result = this.addImagenUrlAndPrecio(productos);
    
    // Filtrar por categoría si se especifica (filtro post-procesado)
    if (categoria) {
      result = result.filter(producto => 
        producto.categoria.toLowerCase() === categoria.toLowerCase()
      );
    }
    
    // Recalcular total después del filtro de categoría
    const finalTotal = categoria ? result.length : total;
    const totalPages = limit ? Math.ceil(finalTotal / limit) : 1;

    return {
      data: result,
      total: finalTotal,
      page: Number(page),
      limit: limit || finalTotal,
      totalPages,
    };
  }

  async findOne(codigo: number): Promise<Product | null> {
    const producto = await this.prisma.product.findUnique({
      where: { 
        codigo,
      },
      include: {
        productImages: {
          orderBy: [
            { es_principal: 'desc' },
            { orden: 'asc' },
          ],
        },
        precioUnitario: true, // Incluir precio unitario para obtener precioA
      },
    });

    if (!producto) return null;

    // Agregar imagen_url y precioA
    const productosConImagen = this.addImagenUrlAndPrecio([producto]);
    return productosConImagen[0];
  }

  async update(codigo: number, updateProductDto: UpdateProductDto): Promise<Product> {
    console.log('=== PRODUCTS UPDATE - START ===');
    console.log('Codigo recibido:', codigo, 'Tipo:', typeof codigo);
    console.log('DTO recibido:', JSON.stringify(updateProductDto, null, 2));
    
    // Verificar que el producto existe
    const producto = await this.prisma.product.findUnique({ where: { codigo } });
    console.log('Producto encontrado en DB:', producto ? 'SI' : 'NO');
    
    if (!producto) {
      console.log('ERROR: Producto no encontrado');
      throw new NotFoundException(`Producto con código ${codigo} no encontrado`);
    }

    console.log('Producto antes de actualizar:', JSON.stringify(producto, null, 2));

    const productoActualizado = await this.prisma.product.update({
      where: { codigo },
      data: updateProductDto,
    });

    console.log('Producto después de actualizar:', JSON.stringify(productoActualizado, null, 2));
    
    // Verificar que sigue existiendo después de la actualización
    const verificacion = await this.prisma.product.findUnique({ where: { codigo } });
    console.log('Verificación post-update - Producto existe:', verificacion ? 'SI' : 'NO');
    console.log('=== PRODUCTS UPDATE - END ===');

    return productoActualizado;
  }

  async remove(codigo: number): Promise<Product> {
    // Verificar que el producto existe
    const producto = await this.prisma.product.findUnique({ where: { codigo } });
    if (!producto) {
      throw new NotFoundException(`Producto con código ${codigo} no encontrado`);
    }

    // Eliminación física del producto
    return await this.prisma.product.delete({
      where: { codigo },
    });
  }

  /**
   * Obtener lista de marcas únicas con conteo de productos
   */
  async getMarcas(): Promise<{ nombre_marca: string; total_productos: number }[]> {
    try {
      // Obtener todas las marcas únicas usando groupBy
      const marcas = await this.prisma.product.groupBy({
        by: ['marca'],
        where: {
          marca: {
            not: null,
          },
          // Solo productos con stock
          NOT: [
            { existenciaTotal: '0' },
            { existenciaTotal: '' },
            { existenciaTotal: null },
          ],
        },
        _count: {
          marca: true,
        },
        orderBy: {
          marca: 'asc',
        },
      });

      // Mapear a formato deseado, filtrando nulls explícitamente
      return marcas
        .filter((marca): marca is typeof marca & { marca: string } => marca.marca !== null)
        .map(marca => ({
          nombre_marca: marca.marca,
          total_productos: marca._count.marca,
        }));
    } catch (error) {
      console.error('Error al obtener marcas:', error);
      return [];
    }
  }

  /**
   * Obtener lista de categorías con conteo de productos
   * Las categorías se determinan dinámicamente basándose en palabras clave en los nombres de productos
   */
  async getCategorias(): Promise<{ nombre_categoria: string; total_productos: number }[]> {
    try {
      // Obtener todos los productos con stock
      const productos = await this.prisma.product.findMany({
        where: {
          NOT: [
            { existenciaTotal: '0' },
            { existenciaTotal: '' },
            { existenciaTotal: null },
          ],
          precioUnitario: {
            precioA: {
              gt: 0,
            },
          },
        },
        select: {
          producto: true,
        },
      });

      // Clasificar productos por categoría y contar
      const categoriasMap = new Map<string, number>();

      productos.forEach(producto => {
        const categoria = determineProductCategory(producto.producto);
        categoriasMap.set(categoria, (categoriasMap.get(categoria) || 0) + 1);
      });

      // Convertir a array y ordenar por nombre de categoría
      const categorias = Array.from(categoriasMap.entries())
        .map(([nombre_categoria, total_productos]) => ({
          nombre_categoria,
          total_productos,
        }))
        .sort((a, b) => {
          // Poner "Otros" al final
          if (a.nombre_categoria === 'Otros') return 1;
          if (b.nombre_categoria === 'Otros') return -1;
          return a.nombre_categoria.localeCompare(b.nombre_categoria);
        });

      return categorias;
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      return [];
    }
  }
}
