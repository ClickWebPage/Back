import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class ImagesService {
  constructor(private prisma: PrismaService) {}

  // Directorio donde se almacenarán las imágenes
  // Desde backend/dist/images -> subir 3 niveles para llegar a frontend-chpc
  // Luego acceder a public/Productos
  private readonly uploadDir = path.join(
    __dirname,
    '..',
    '..',
    '..',
    'public',
    'Productos',
  );

  /**
   * Obtener todas las imágenes de un producto
   */
  async findByProduct(productId: number) {
    return this.prisma.productImage.findMany({
      where: { producto_id: productId },
      orderBy: [{ es_principal: 'desc' }, { orden: 'asc' }],
    });
  }

  /**
   * Obtener una imagen por ID
   */
  async findOne(id: number) {
    const image = await this.prisma.productImage.findUnique({
      where: { id },
      include: { producto: true },
    });

    if (!image) {
      throw new NotFoundException(`Imagen con ID ${id} no encontrada`);
    }

    return image;
  }

  /**
   * Crear una nueva imagen para un producto
   */
  async create(createImageDto: CreateImageDto) {
    // Verificar que el producto existe
    const product = await this.prisma.product.findUnique({
      where: { id: createImageDto.producto_id },
    });

    if (!product) {
      throw new NotFoundException(
        `Producto con ID ${createImageDto.producto_id} no encontrado`,
      );
    }

    // Si es imagen principal, desmarcar otras imágenes principales
    if (createImageDto.es_principal) {
      await this.prisma.productImage.updateMany({
        where: {
          producto_id: createImageDto.producto_id,
          es_principal: true,
        },
        data: { es_principal: false },
      });
    }

    return this.prisma.productImage.create({
      data: createImageDto,
    });
  }

  /**
   * Actualizar una imagen
   */
  async update(id: number, updateImageDto: UpdateImageDto) {
    const image = await this.findOne(id);

    // Si se marca como principal, desmarcar otras
    if (updateImageDto.es_principal) {
      await this.prisma.productImage.updateMany({
        where: {
          producto_id: image.producto_id,
          es_principal: true,
          id: { not: id },
        },
        data: { es_principal: false },
      });
    }

    return this.prisma.productImage.update({
      where: { id },
      data: updateImageDto,
    });
  }

  /**
   * Eliminar una imagen
   */
  async remove(id: number) {
    const image = await this.findOne(id);

    // Eliminar archivo físico si existe
    try {
      const filePath = path.join(
        __dirname,
        '..',
        '..',
        '..',
        '..',
        'public',
        image.ruta_imagen.replace(/^\//, ''),
      );
      await fs.unlink(filePath);
    } catch (error) {
      console.warn(`No se pudo eliminar el archivo físico: ${error.message}`);
    }

    // Eliminar registro de base de datos
    return this.prisma.productImage.delete({
      where: { id },
    });
  }

  /**
   * Establecer una imagen como principal
   */
  async setAsPrincipal(id: number) {
    const image = await this.findOne(id);

    // Desmarcar otras imágenes principales del mismo producto
    await this.prisma.productImage.updateMany({
      where: {
        producto_id: image.producto_id,
        es_principal: true,
      },
      data: { es_principal: false },
    });

    // Marcar esta como principal
    return this.prisma.productImage.update({
      where: { id },
      data: { es_principal: true },
    });
  }

  /**
   * Reordenar imágenes
   */
  async reorder(productId: number, imageIds: number[]) {
    const updates = imageIds.map((imageId, index) =>
      this.prisma.productImage.update({
        where: { id: imageId, producto_id: productId },
        data: { orden: index },
      }),
    );

    await this.prisma.$transaction(updates);

    return this.findByProduct(productId);
  }

  /**
   * Guardar archivo subido
   */
  async saveUploadedFile(file: Express.Multer.File, productId: number) {
    try {
      console.log('=== DEBUG UPLOAD ===');
      console.log('uploadDir:', this.uploadDir);
      console.log('Archivo recibido:', file.originalname);
      console.log('Tamaño buffer:', file.buffer.length);
      
      // Asegurar que el directorio existe
      await fs.mkdir(this.uploadDir, { recursive: true });
      console.log('Directorio creado/verificado');

      // Generar nombre único
      const timestamp = Date.now();
      const ext = path.extname(file.originalname);
      const fileName = `producto-${productId}-${timestamp}${ext}`;
      const filePath = path.join(this.uploadDir, fileName);
      
      console.log('Ruta completa archivo:', filePath);

      // Guardar archivo
      await fs.writeFile(filePath, file.buffer);
      console.log('Archivo guardado exitosamente');

      // Retornar ruta relativa
      return `/Productos/${fileName}`;
    } catch (error) {
      console.error('ERROR al guardar archivo:', error);
      throw new BadRequestException(
        `Error al guardar archivo: ${error.message}`,
      );
    }
  }
}
