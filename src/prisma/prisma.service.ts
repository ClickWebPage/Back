import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    // Configuración optimizada para producción
    const isProduction = process.env.NODE_ENV === 'production';
    
    super({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
      errorFormat: 'minimal',
    });

    console.log('🔧 Prisma configurado para', isProduction ? 'Producción' : 'Desarrollo');
  }

  async onModuleInit() {
    try {
      console.log('🔌 Conectando a PostgreSQL...');
      await this.$connect();
      console.log('✅ Conexión establecida exitosamente');
    } catch (error) {
      console.error('❌ Error de conexión:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    console.log('🔌 Desconectando de PostgreSQL...');
    await this.$disconnect();
  }
}
