import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import knex, { Knex } from 'knex';

@Injectable()
export class ErpSyncService {
  private readonly logger = new Logger(ErpSyncService.name);
  private erpDb: Knex;

  constructor(private prisma: PrismaService) {
    // Configura la conexión al ERP (separada de tu DB local)
    this.erpDb = knex({
      client: 'pg', // Cambia según el ERP (oracle, pg, mysql)
      connection: {
        host: 'erp-server-ip',
        user: 'user',
        password: 'password',
        database: 'ERP_DB',
      },
    });
  }

  // Ejecutar cada hora (ajusta según necesidad)
  @Cron(CronExpression.EVERY_HOUR)
  async syncProducts() {
    const ENTITY_NAME = 'Productos';
    this.logger.log(`Iniciando sincronización de ${ENTITY_NAME}...`);

    // 1. Obtener la última fecha de sincronización ("Watermark")
    const lastSyncLog = await this.prisma.syncLog.findUnique({
      where: { entityName: ENTITY_NAME },
    });

    const lastSyncDate = lastSyncLog?.lastSync || new Date('1900-01-01');

    try {
      // 2. Consultar al ERP solo los cambios (Eficiencia de Ancho de Banda)
      // Asumiendo que la vista del ERP tiene una columna 'FECHA_MODIFICACION'
      const updates = await this.erpDb('VISTA_PRODUCTOS_ERP')
        .where('FECHA_MODIFICACION', '>', lastSyncDate)
        .select('ID_ERP', 'NOMBRE', 'PRECIO', 'STOCK', 'FECHA_MODIFICACION', 'DESCRIPCION', 'IMAGEN_URL') // Trae solo columnas necesarias
        .limit(1000); // Paginación para no saturar memoria

      if (updates.length === 0) {
        this.logger.log('No hay datos nuevos para sincronizar.');
        return;
      }

      // 3. Actualizar Base de Datos Local (Upsert)
      // Usamos una transacción para asegurar integridad
      await this.prisma.$transaction(async (tx) => {
        for (const row of updates) {
          await tx.product.upsert({
            where: { erpId: row.ID_ERP },
            update: {
              nombre_producto: row.NOMBRE,
              precio: row.PRECIO,
              stock: row.STOCK,
            },
            create: {
              erpId: row.ID_ERP,
              nombre_producto: row.NOMBRE,
              precio: row.PRECIO,
              stock: row.STOCK,
              descripcion: row.DESCRIPCION || '', // Valor por defecto si no viene del ERP
              imagen_url: row.IMAGEN_URL || '',   // Valor por defecto
            },
          });
        }

        // 4. Actualizar la marca de agua con la fecha más reciente encontrada
        const maxDate = updates.reduce(
          (max, p) => (p.FECHA_MODIFICACION > max ? p.FECHA_MODIFICACION : max),
          lastSyncDate,
        );

        await tx.syncLog.upsert({
          where: { entityName: ENTITY_NAME },
          update: { lastSync: maxDate, status: 'SUCCESS' },
          create: { entityName: ENTITY_NAME, lastSync: maxDate, status: 'SUCCESS' },
        });
      });

      this.logger.log(`Sincronizados ${updates.length} registros.`);

    } catch (error) {
      this.logger.error('Error en sincronización', error);
    }
  }
}
