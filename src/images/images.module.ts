import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ImagesController } from './images.controller';
import { ImagesService } from './images.service';
import { ImageOptimizationService } from './image-optimization.service';
import { PrismaModule } from '../prisma/prisma.module';
import { memoryStorage } from 'multer';

@Module({
  imports: [
    PrismaModule,
    MulterModule.register({
      storage: memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB máximo
        files: 1, // Solo un archivo por vez
        fields: 10, // Máximo 10 campos en el form
      },
      fileFilter: (req, file, callback) => {
        console.log('=== MULTER FILE FILTER ===');
        console.log('File mimetype:', file.mimetype);
        console.log('File originalname:', file.originalname);
        
        const allowedMimes = [
          'image/jpeg',
          'image/jpg', 
          'image/png', 
          'image/webp',
          'image/gif'
        ];
        
        if (allowedMimes.includes(file.mimetype)) {
          console.log('✅ File type accepted');
          callback(null, true);
        } else {
          console.log('❌ File type rejected');
          callback(new Error(`Tipo de archivo no permitido: ${file.mimetype}. Solo se aceptan: ${allowedMimes.join(', ')}`), false);
        }
      },
    }),
  ],
  controllers: [ImagesController],
  providers: [ImagesService, ImageOptimizationService],
  exports: [ImagesService, ImageOptimizationService],
})
export class ImagesModule {}
