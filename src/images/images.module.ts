import { Module } from '@nestjs/common';
import { ImagesController } from './images.controller';
import { ImagesService } from './images.service';
import { ImageOptimizationService } from './image-optimization.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ImagesController],
  providers: [ImagesService, ImageOptimizationService],
  exports: [ImagesService, ImageOptimizationService],
})
export class ImagesModule {}
