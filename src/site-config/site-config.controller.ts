import { Controller, Get, Post, Body, Param, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { MulterFile } from '../types/multer.types';
import { SiteConfigService, VideoPlaylistItem } from './site-config.service';
import { UpdateSiteConfigDto } from './dto/update-site-config.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/roles.enum';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Configuración del Sitio')
@Controller('configuracion')
export class SiteConfigController {
  constructor(private readonly siteConfigService: SiteConfigService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener toda la configuración del sitio' })
  findAll() {
    return this.siteConfigService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar o crear una configuración (solo administradores)' })
  upsert(@Body() updateSiteConfigDto: UpdateSiteConfigDto) {
    return this.siteConfigService.upsert(updateSiteConfigDto);
  }

  @Get('logo/url')
  @ApiOperation({ summary: 'Obtener la URL del logo actual' })
  getLogo() {
    return this.siteConfigService.getLogo();
  }

  @Post('logo/upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Subir un archivo de imagen como logo (solo administradores)' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadLogo(@UploadedFile() file: MulterFile) {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }
    return this.siteConfigService.uploadLogoFile(file);
  }

  // ========== ENDPOINTS DE COLORES ==========

  @Get('colores/tema')
  @ApiOperation({ summary: 'Obtener los colores de énfasis del sitio' })
  getColores() {
    return this.siteConfigService.getColores();
  }

  @Post('colores/tema')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar los colores de énfasis del sitio (solo administradores)' })
  updateColores(@Body() colores: {
    primary?: string;
    primaryDark?: string;
    primaryLight?: string;
    success?: string;
    error?: string;
  }) {
    return this.siteConfigService.updateColores(colores);
  }

  @Post('colores/reset')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Restablecer colores a valores por defecto (solo administradores)' })
  resetColores() {
    return this.siteConfigService.resetColores();
  }

  // ========== ENDPOINTS DE VIDEO DESTACADO ==========

  @Get('video-destacado/url')
  @ApiOperation({ summary: 'Obtener la URL del video destacado' })
  getVideoDestacado() {
    return this.siteConfigService.getVideoDestacado();
  }

  @Post('video-destacado/url')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar la URL del video destacado (solo administradores)' })
  updateVideoDestacado(@Body() body: { videoUrl: string }) {
    return this.siteConfigService.updateVideoDestacado(body.videoUrl);
  }

  // ========== ENDPOINTS DE PLAYLIST DE VIDEOS ==========

  @Get('video-playlist')
  @ApiOperation({ summary: 'Obtener la lista de videos de la playlist' })
  getVideoPlaylist() {
    return this.siteConfigService.getVideoPlaylist();
  }

  @Post('video-playlist')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Guardar la playlist completa de videos (solo administradores)' })
  updateVideoPlaylist(@Body() body: { videos: VideoPlaylistItem[] }) {
    return this.siteConfigService.updateVideoPlaylist(body.videos);
  }

  // ========== RUTA GENÉRICA (debe ir AL FINAL para no interceptar rutas específicas) ==========

  @Get(':clave')
  @ApiOperation({ summary: 'Obtener una configuración por clave' })
  findByKey(@Param('clave') clave: string) {
    return this.siteConfigService.findByKey(clave);
  }
}
