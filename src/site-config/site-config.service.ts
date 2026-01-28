import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSiteConfigDto } from './dto/update-site-config.dto';

@Injectable()
export class SiteConfigService {
  constructor(private prisma: PrismaService) {}

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

  async getLogo() {
    try {
      const config = await this.findByKey('logo_url');
      return { valor: config.valor }; // Retornar objeto con propiedad 'valor'
    } catch (error) {
      return { valor: null }; // Si no existe, retornar objeto con valor null
    }
  }
}
