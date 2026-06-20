import { Module } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { AuditLogController } from './audit-log.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AuditLogController],
  providers: [AuditLogService],
  // Se exporta para poder inyectarlo en otros módulos si fuera necesario
  exports: [AuditLogService],
})
export class AuditLogModule {}
