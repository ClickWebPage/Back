import { Injectable, BadRequestException } from '@nestjs/common';
import sharp from 'sharp';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class ImageOptimizationService {
  // Directorio donde se almacenarán las imágenes
  private readonly uploadDir = path.join(
    __dirname,
    '..',
    '..',
    '..',
    'public',
    'Productos',
  );

  /**
   * Convertir imagen a formato WebP con compresión optimizada
   * @param file - Archivo subido
   * @param productId - ID del producto
   * @returns Nombre del archivo WebP generado
   */
  async convertToWebp(
    file: Express.Multer.File,
    productId: number,
  ): Promise<string> {
    try {
      console.log('=== OPTIMIZACIÓN DE IMAGEN ===');
      console.log('Archivo original:', file.originalname);
      console.log('Tipo MIME:', file.mimetype);
      console.log('Tamaño original:', this.formatBytes(file.size));

      // Asegurar que el directorio existe
      await fs.mkdir(this.uploadDir, { recursive: true });

      // Generar nombre único con extensión .webp
      const timestamp = Date.now();
      const baseFileName = path.basename(
        file.originalname,
        path.extname(file.originalname),
      );
      const safeFileName = baseFileName.replace(/[^a-zA-Z0-9-_]/g, '_');
      const fileName = `producto-${productId}-${safeFileName}-${timestamp}.webp`;
      const filePath = path.join(this.uploadDir, fileName);

      // Procesar imagen con sharp
      const imageBuffer = await sharp(file.buffer)
        .resize(1200, 1200, {
          fit: 'inside', // Mantener proporción, no exceder dimensiones
          withoutEnlargement: true, // No agrandar imágenes pequeñas
        })
        .webp({
          quality: 85, // Calidad óptima (0-100)
          effort: 4, // Esfuerzo de compresión (0-6, mayor = mejor compresión pero más lento)
        })
        .toBuffer();

      // Guardar archivo WebP
      await fs.writeFile(filePath, imageBuffer);

      const savedSize = imageBuffer.length;
      const compressionRatio = ((1 - savedSize / file.size) * 100).toFixed(2);

      console.log('Imagen optimizada:');
      console.log('  - Tamaño final:', this.formatBytes(savedSize));
      console.log('  - Reducción:', `${compressionRatio}%`);
      console.log('  - Archivo guardado:', fileName);
      console.log('=================================');

      // Retornar ruta relativa
      return `/Productos/${fileName}`;
    } catch (error) {
      console.error('ERROR en optimización de imagen:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new BadRequestException(
        `Error al optimizar imagen: ${errorMessage}`,
      );
    }
  }

  /**
   * Convertir imagen con dimensiones personalizadas
   * @param file - Archivo subido
   * @param productId - ID del producto
   * @param maxWidth - Ancho máximo
   * @param maxHeight - Alto máximo
   * @param quality - Calidad de compresión (0-100)
   * @returns Nombre del archivo WebP generado
   */
  async convertToWebpCustom(
    file: Express.Multer.File,
    productId: number,
    maxWidth: number = 1200,
    maxHeight: number = 1200,
    quality: number = 85,
  ): Promise<string> {
    try {
      console.log('=== OPTIMIZACIÓN PERSONALIZADA ===');
      console.log('Dimensiones máximas:', `${maxWidth}x${maxHeight}`);
      console.log('Calidad:', quality);

      // Asegurar que el directorio existe
      await fs.mkdir(this.uploadDir, { recursive: true });

      // Generar nombre único
      const timestamp = Date.now();
      const baseFileName = path.basename(
        file.originalname,
        path.extname(file.originalname),
      );
      const safeFileName = baseFileName.replace(/[^a-zA-Z0-9-_]/g, '_');
      const fileName = `producto-${productId}-${safeFileName}-${timestamp}.webp`;
      const filePath = path.join(this.uploadDir, fileName);

      // Procesar imagen
      const imageBuffer = await sharp(file.buffer)
        .resize(maxWidth, maxHeight, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({
          quality: quality,
          effort: 4,
        })
        .toBuffer();

      // Guardar archivo
      await fs.writeFile(filePath, imageBuffer);

      console.log('Imagen guardada:', fileName);
      console.log('===================================');

      return `/Productos/${fileName}`;
    } catch (error) {
      console.error('ERROR en optimización personalizada:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new BadRequestException(
        `Error al optimizar imagen: ${errorMessage}`,
      );
    }
  }

  /**
   * Crear múltiples versiones de una imagen (thumbnail, medium, large)
   * @param file - Archivo subido
   * @param productId - ID del producto
   * @returns Objeto con rutas de las diferentes versiones
   */
  async createMultipleVersions(
    file: Express.Multer.File,
    productId: number,
  ): Promise<{
    thumbnail: string;
    medium: string;
    large: string;
  }> {
    try {
      console.log('=== CREANDO MÚLTIPLES VERSIONES ===');

      // Asegurar que el directorio existe
      await fs.mkdir(this.uploadDir, { recursive: true });

      const timestamp = Date.now();
      const baseFileName = path.basename(
        file.originalname,
        path.extname(file.originalname),
      );
      const safeFileName = baseFileName.replace(/[^a-zA-Z0-9-_]/g, '_');

      // Thumbnail (pequeña)
      const thumbName = `producto-${productId}-${safeFileName}-${timestamp}-thumb.webp`;
      const thumbPath = path.join(this.uploadDir, thumbName);
      await sharp(file.buffer)
        .resize(300, 300, { fit: 'cover' })
        .webp({ quality: 80, effort: 4 })
        .toFile(thumbPath);

      // Medium (mediana)
      const mediumName = `producto-${productId}-${safeFileName}-${timestamp}-medium.webp`;
      const mediumPath = path.join(this.uploadDir, mediumName);
      await sharp(file.buffer)
        .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85, effort: 4 })
        .toFile(mediumPath);

      // Large (grande)
      const largeName = `producto-${productId}-${safeFileName}-${timestamp}-large.webp`;
      const largePath = path.join(this.uploadDir, largeName);
      await sharp(file.buffer)
        .resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 90, effort: 4 })
        .toFile(largePath);

      console.log('Versiones creadas exitosamente');
      console.log('====================================');

      return {
        thumbnail: `/Productos/${thumbName}`,
        medium: `/Productos/${mediumName}`,
        large: `/Productos/${largeName}`,
      };
    } catch (error) {
      console.error('ERROR al crear múltiples versiones:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new BadRequestException(
        `Error al crear versiones de imagen: ${errorMessage}`,
      );
    }
  }

  /**
   * Formatear bytes a formato legible
   */
  private formatBytes(bytes: number, decimals: number = 2): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  /**
   * Obtener metadata de una imagen
   */
  async getImageMetadata(file: Express.Multer.File): Promise<sharp.Metadata> {
    try {
      return await sharp(file.buffer).metadata();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new BadRequestException(
        `Error al leer metadata de imagen: ${errorMessage}`,
      );
    }
  }
}
