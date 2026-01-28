import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImagesService } from './images.service';
import { ImageOptimizationService } from './image-optimization.service';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/roles.enum';

@Controller('images')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ImagesController {
  constructor(
    private readonly imagesService: ImagesService,
    private readonly imageOptimizationService: ImageOptimizationService,
  ) {}

  /**
   * Obtener todas las imágenes de un producto
   */
  @Get('producto/:productId')
  async findByProduct(@Param('productId', ParseIntPipe) productId: number) {
    return this.imagesService.findByProduct(productId);
  }

  /**
   * Obtener una imagen por ID
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.imagesService.findOne(id);
  }

  /**
   * Subir y crear nueva imagen para un producto
   */
  @Post('upload/:productId')
  @Roles(Role.ADMIN, Role.VENDEDOR)
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @Param('productId', ParseIntPipe) productId: number,
    @UploadedFile() file: Express.Multer.File,
    @Body('es_principal') esPrincipal?: string,
    @Body('orden') orden?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    // Validar tipo de archivo
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Tipo de archivo no permitido. Solo se aceptan: JPG, PNG, WEBP',
      );
    }

    // Validar tamaño (5MB máximo)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException(
        'El archivo es demasiado grande. Máximo 5MB',
      );
    }

    // Optimizar y convertir imagen a WebP usando sharp
    const rutaImagen = await this.imageOptimizationService.convertToWebp(
      file,
      productId,
    );

    // Crear registro en base de datos
    const createImageDto: CreateImageDto = {
      producto_id: productId,
      ruta_imagen: rutaImagen,
      nombre_archivo: file.originalname.replace(/\.(jpg|jpeg|png)$/i, '.webp'),
      tipo_archivo: 'image/webp', // Ahora siempre es WebP
      tamano_archivo: file.size, // Tamaño original (se optimizará)
      es_principal: esPrincipal === 'true',
      orden: orden ? parseInt(orden) : 0,
    };

    return this.imagesService.create(createImageDto);
  }

  /**
   * Subir imagen con optimización personalizada (WebP)
   * Permite especificar dimensiones y calidad personalizadas
   */
  @Post('upload-optimized/:productId')
  @Roles(Role.ADMIN, Role.VENDEDOR)
  @UseInterceptors(FileInterceptor('file'))
  async uploadImageOptimized(
    @Param('productId', ParseIntPipe) productId: number,
    @UploadedFile() file: Express.Multer.File,
    @Body('es_principal') esPrincipal?: string,
    @Body('orden') orden?: string,
    @Body('maxWidth') maxWidth?: string,
    @Body('maxHeight') maxHeight?: string,
    @Body('quality') quality?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    // Validar tipo de archivo
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Tipo de archivo no permitido. Solo se aceptan: JPG, PNG, WEBP',
      );
    }

    // Validar tamaño (10MB máximo para este endpoint)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException(
        'El archivo es demasiado grande. Máximo 10MB',
      );
    }

    // Convertir parámetros opcionales
    const width = maxWidth ? parseInt(maxWidth) : 1200;
    const height = maxHeight ? parseInt(maxHeight) : 1200;
    const qual = quality ? parseInt(quality) : 85;

    // Optimizar con parámetros personalizados
    const rutaImagen = await this.imageOptimizationService.convertToWebpCustom(
      file,
      productId,
      width,
      height,
      qual,
    );

    // Crear registro en base de datos
    const createImageDto: CreateImageDto = {
      producto_id: productId,
      ruta_imagen: rutaImagen,
      nombre_archivo: file.originalname.replace(/\.(jpg|jpeg|png)$/i, '.webp'),
      tipo_archivo: 'image/webp',
      tamano_archivo: file.size,
      es_principal: esPrincipal === 'true',
      orden: orden ? parseInt(orden) : 0,
    };

    return this.imagesService.create(createImageDto);
  }

  /**
   * Actualizar datos de una imagen
   */
  @Put(':id')
  @Roles(Role.ADMIN, Role.VENDEDOR)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateImageDto: UpdateImageDto,
  ) {
    return this.imagesService.update(id, updateImageDto);
  }

  /**
   * Eliminar una imagen
   */
  @Delete(':id')
  @Roles(Role.ADMIN, Role.VENDEDOR)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.imagesService.remove(id);
  }

  /**
   * Establecer imagen como principal
   */
  @Put(':id/principal')
  @Roles(Role.ADMIN, Role.VENDEDOR)
  async setAsPrincipal(@Param('id', ParseIntPipe) id: number) {
    return this.imagesService.setAsPrincipal(id);
  }

  /**
   * Reordenar imágenes de un producto
   */
  @Put('producto/:productId/reorder')
  @Roles(Role.ADMIN, Role.VENDEDOR)
  async reorder(
    @Param('productId', ParseIntPipe) productId: number,
    @Body('imageIds') imageIds: number[],
  ) {
    return this.imagesService.reorder(productId, imageIds);
  }
}
