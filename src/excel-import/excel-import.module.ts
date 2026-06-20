import { Module } from '@nestjs/common';
import { ExcelImportController } from './excel-import.controller';
import { ExcelImportService } from './excel-import.service';

@Module({
  controllers: [ExcelImportController],
  providers: [ExcelImportService],
})
export class ExcelImportModule {}
