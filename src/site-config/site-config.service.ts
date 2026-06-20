import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSiteConfigDto } from './dto/update-site-config.dto';
import type { MulterFile } from '../types/multer.types';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';

@Injectable()
export class SiteConfigService {
  private readonly uploadDir: string;

  constructor(private prisma: PrismaService) {
    this.uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '..', '..', '..', 'public');
  }

  async findAll() {
    return this.prisma.siteConfig.findMany();
  }

  async findByKey(clave: string) {
    const config = await this.prisma.siteConfig.findUnique({
      where: { clave },
    });

    if (!config) {
      throw new NotFoundException(`Configuración con clave '${clave}' no encontrada`);
    }

    return config;
  }

  async upsert(updateSiteConfigDto: UpdateSiteConfigDto) {
    const { clave, valor } = updateSiteConfigDto;

    return this.prisma.siteConfig.upsert({
      where: { clave },
      update: { valor },
      create: { clave, valor },
    });
  }

  async updateLogo(logoUrl: string) {
    return this.upsert({ clave: 'logo_url', valor: logoUrl });
  }

  async uploadLogoFile(file: MulterFile): Promise<{ url: string }> {
    try {
      const logoDir = path.join(this.uploadDir, 'logo');

      if (!fsSync.existsSync(logoDir)) {
        await fs.mkdir(logoDir, { recursive: true });
      }

      const ext = path.extname(file.originalname) || '.png';
      const fileName = `logo-${Date.now()}${ext}`;
      const filePath = path.join(logoDir, fileName);

      await fs.writeFile(filePath, file.buffer);

      const logoUrl = `/uploads/logo/${fileName}`;
      await this.updateLogo(logoUrl);

      return { url: logoUrl };
    } catch (error) {
      throw new BadRequestException(`Error al guardar el logo: ${error.message}`);
    }
  }

  async getLogo() {
    try {
      const config = await this.findByKey('logo_url');
      return { valor: config.valor }; // Retornar objeto con propiedad 'valor'
    } catch (error) {
      return { valor: null }; // Si no existe, retornar objeto con valor null
    }
  }

  // ========== CONFIGURACIÓN DE COLORES ==========

  /**
   * Obtiene todos los colores de énfasis configurados
   */
  async getColores() {
    const coloresDefault = {
      primary: '#ffa726',
      primaryDark: '#fb8c00',
      primaryLight: '#ffb74d',
      success: '#4caf50',
      error: '#f44336',
    };

    try {
      const config = await this.prisma.siteConfig.findUnique({
        where: { clave: 'colores_enfasis' },
      });

      if (config) {
        return { valor: JSON.parse(config.valor) };
      }
      return { valor: coloresDefault };
    } catch (error) {
      return { valor: coloresDefault };
    }
  }

  /**
   * Actualiza los colores de énfasis del sitio
   */
  async updateColores(colores: {
    primary?: string;
    primaryDark?: string;
    primaryLight?: string;
    success?: string;
    error?: string;
  }) {
    // Obtener colores actuales para mantener los no modificados
    const coloresActuales = await this.getColores();
    const nuevosColores = {
      ...coloresActuales.valor,
      ...colores,
    };

    return this.prisma.siteConfig.upsert({
      where: { clave: 'colores_enfasis' },
      update: { valor: JSON.stringify(nuevosColores) },
      create: { clave: 'colores_enfasis', valor: JSON.stringify(nuevosColores) },
    });
  }

  /**
   * Restablece los colores a los valores por defecto
   */
  async resetColores() {
    const coloresDefault = {
      primary: '#ffa726',
      primaryDark: '#fb8c00',
      primaryLight: '#ffb74d',
      success: '#4caf50',
      error: '#f44336',
    };

    return this.prisma.siteConfig.upsert({
      where: { clave: 'colores_enfasis' },
      update: { valor: JSON.stringify(coloresDefault) },
      create: { clave: 'colores_enfasis', valor: JSON.stringify(coloresDefault) },
    });
  }

  // ========== CONFIGURACIÓN DE VIDEO DESTACADO ==========

  /**
   * Obtiene la URL del video destacado
   */
  async getVideoDestacado() {
    const videoDefault = 'https://www.youtube.com/embed/r-DF3-FS_6k?si=DW930ua3fe_K9GjD&autoplay=1&mute=1&loop=1&playlist=r-DF3-FS_6k';

    try {
      const config = await this.prisma.siteConfig.findUnique({
        where: { clave: 'video_destacado_url' },
      });

      if (config) {
        return { valor: config.valor };
      }
      return { valor: videoDefault };
    } catch (error) {
      return { valor: videoDefault };
    }
  }

  /**
   * Actualiza la URL del video destacado
   */
  async updateVideoDestacado(videoUrl: string) {
    return this.prisma.siteConfig.upsert({
      where: { clave: 'video_destacado_url' },
      update: { valor: videoUrl },
      create: { clave: 'video_destacado_url', valor: videoUrl },
    });
  }

  // ========== PLAYLIST DE VIDEOS ==========

  /**
   * Obtiene la lista de videos configurados.
   * Retorna [] cuando no hay ninguna playlist guardada en la BD;
   * el frontend aplica su propio placeholder en ese caso.
   */
  async getVideoPlaylist(): Promise<{ valor: VideoPlaylistItem[] }> {
    try {
      const config = await this.prisma.siteConfig.findUnique({
        where: { clave: 'video_playlist' },
      });
      if (config) {
        return { valor: JSON.parse(config.valor) as VideoPlaylistItem[] };
      }
      return { valor: [] };
    } catch {
      return { valor: [] };
    }
  }

  /**
   * Guarda la lista completa de videos
   */
  async updateVideoPlaylist(videos: VideoPlaylistItem[]): Promise<{ valor: VideoPlaylistItem[] }> {
    // Mantener compatibilidad hacia atrás: actualizar video_destacado_url con el primer video
    if (videos.length > 0) {
      const first = videos[0];
      const embedUrl = this.buildEmbedUrl(first.url);
      await this.updateVideoDestacado(embedUrl);
    }

    await this.prisma.siteConfig.upsert({
      where: { clave: 'video_playlist' },
      update: { valor: JSON.stringify(videos) },
      create: { clave: 'video_playlist', valor: JSON.stringify(videos) },
    });

    return { valor: videos };
  }

  /**
   * Construye la URL de embed con parámetros para autoplay silenciado
   */
  private buildEmbedUrl(baseUrl: string): string {
    try {
      const url = new URL(baseUrl);
      url.searchParams.set('autoplay', '1');
      url.searchParams.set('mute', '1');
      const videoId = baseUrl.match(/\/embed\/([^?&]+)/)?.[1];
      if (videoId) {
        url.searchParams.set('playlist', videoId);
        url.searchParams.set('loop', '1');
      }
      return url.toString();
    } catch {
      return baseUrl;
    }
  }
}

export interface VideoPlaylistItem {
  id: string;
  titulo: string;
  url: string;
  duracion_segundos: number;
}
