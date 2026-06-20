import { Injectable, BadRequestException } from '@nestjs/common';
import sharp from 'sharp';
import * as fs from 'fs/promises';
import * as path from 'path';
import type { MulterFile } from '../types/multer.types';

@Injectable()
export class ImageOptimizationService {
  // Directorio donde se almacenarán las imágenes (configurable por variable de entorno)
  private readonly uploadDir: string;

  constructor() {
    // Usar variable de entorno o directorio por defecto
    this.uploadDir = process.env.UPLOAD_DIR 
      ? path.join(process.env.UPLOAD_DIR, 'productos')
      : path.join(__dirname, '..', '..', '..', 'public', 'Productos');
    
    console.log('💾 Directorio de imágenes configurado:', this.uploadDir);
  }

  /**
   * Convertir imagen a formato WebP con compresión optimizada
   * @param file - Archivo subido
   * @param productId - ID del producto
   * @returns Nombre del archivo WebP generado
   */
  async convertToWebp(
    file: MulterFile,
    productId: number,
  ): Promise<string> {
    try {
      console.log('=== OPTIMIZACIÓN DE IMAGEN ===');
      console.log('Archivo original:', file.originalname);
      console.log('Tipo MIME:', file.mimetype);
      console.log('Tamaño original:', this.formatBytes(file.size));

      // Validar que el buffer existe
      if (!file.buffer || file.buffer.length === 0) {
        throw new BadRequestException('El buffer de la imagen está vacío');
      }

      // Asegurar que el directorio existe
      try {
        await fs.mkdir(this.uploadDir, { recursive: true });
        console.log('✅ Directorio de subida verificado:', this.uploadDir);
      } catch (dirError) {
        console.error('❌ Error creando directorio:', dirError);
        throw new BadRequestException('Error preparando directorio de imágenes');
      }

      // Generar nombre único con extensión .webp
      const timestamp = Date.now();
      const baseFileName = path.basename(
        file.originalname,
        path.extname(file.originalname),
      );
      const safeFileName = baseFileName.replace(/[^a-zA-Z0-9-_]/g, '_');
      const fileName = `producto-${productId}-${safeFileName}-${timestamp}.webp`;
      const filePath = path.join(this.uploadDir, fileName);

      console.log('Procesando imagen con sharp...');
      console.log('Archivo destino:', fileName);

      // Procesar imagen con sharp
      let imageBuffer: Buffer;
      try {
        imageBuffer = await sharp(file.buffer)
          .resize(1200, 1200, {
            fit: 'inside', // Mantener proporción, no exceder dimensiones
            withoutEnlargement: true, // No agrandar imágenes pequeñas
          })
          .webp({
            quality: 85, // Calidad óptima (0-100)
            effort: 4, // Esfuerzo de compresión (0-6, mayor = mejor compresión pero más lento)
          })
          .toBuffer();
      } catch (sharpError) {
        console.error('❌ Error procesando imagen con Sharp:', sharpError);
        throw new BadRequestException(
          `Error procesando imagen: ${sharpError instanceof Error ? sharpError.message : 'Error de Sharp'}`
        );
      }

      // Guardar archivo WebP
      try {
        await fs.writeFile(filePath, imageBuffer);
        console.log('✅ Archivo guardado en:', filePath);
      } catch (writeError) {
        console.error('❌ Error escribiendo archivo:', writeError);
        throw new BadRequestException('Error guardando imagen optimizada');
      }

      const savedSize = imageBuffer.length;
      const compressionRatio = ((1 - savedSize / file.size) * 100).toFixed(2);

      console.log('Imagen optimizada:');
      console.log('  - Tamaño final:', this.formatBytes(savedSize));
      console.log('  - Reducción:', `${compressionRatio}%`);
      console.log('  - Archivo guardado:', fileName);
      console.log('=================================');

      // Retornar ruta relativa para acceso público (coincide con el prefijo de static assets)
      return `/uploads/productos/${fileName}`;
    } catch (error) {
      console.error('ERROR en optimización de imagen:', error);
      
      if (error instanceof BadRequestException) {
        throw error;
      }
      
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
    file: MulterFile,
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

      return `/uploads/productos/${fileName}`;
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
    file: MulterFile,
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
        thumbnail: `/uploads/productos/${thumbName}`,
        medium: `/uploads/productos/${mediumName}`,
        large: `/uploads/productos/${largeName}`,
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
  async getImageMetadata(file: MulterFile): Promise<sharp.Metadata> {
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
