import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  async getSystemStatus(): Promise<any> {
    const status = {
      server: {
        status: 'online',
        message: 'CHPC API funcionando correctamente',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
      },
      database: {
        status: 'unknown',
        message: '',
        connectionString: process.env.DATABASE_URL ? 'Configurado' : 'No configurado',
      },
      warnings: [] as string[],
      errors: [] as string[],
    };

    // Verificar conexión a la base de datos
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      status.database.status = 'connected';
      status.database.message = 'Conexión exitosa';
    } catch (error) {
      status.database.status = 'error';
      status.database.message = error.message || 'Error de conexión';
      status.errors.push(`BD: ${error.message}`);
    }

    // Verificar variables de entorno críticas
    if (!process.env.DATABASE_URL) {
      status.warnings.push('DATABASE_URL no configurado');
    }
    if (!process.env.JWT_SECRET) {
      status.warnings.push('JWT_SECRET no configurado');
    }

    return status;
  }

  getHello(): any {
    return {
      message: 'CHPC API - Backend funcionando correctamente',
      version: '1.0.0',
      status: 'active',
      timestamp: new Date().toISOString()
    };
  }
}
