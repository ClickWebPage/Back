import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import type { MulterFile } from '../types/multer.types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/roles.enum';
import { ExcelImportService } from './excel-import.service';
import * as XLSX from 'xlsx';

const EXCEL_MIME_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
];

@Controller('excel-import')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class ExcelImportController {
  constructor(private readonly excelImportService: ExcelImportService) {}

  @Post('preview')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async preview(@UploadedFile() file: MulterFile) {
    this.validateExcelFile(file);
    return this.excelImportService.previewImport(file.buffer);
  }

  @Post('apply')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async apply(@UploadedFile() file: MulterFile) {
    this.validateExcelFile(file);
    return this.excelImportService.applyImport(file.buffer);
  }

  @Get('template')
  async downloadTemplate(@Res() res: Response) {
    const workbook = XLSX.utils.book_new();

    // Formato combinado: una sola hoja con producto + precio por fila
    const combinedRows = [
      {
        'Código': 3605,
        'Producto': 'ACCESS POINT TP-LINK 300MBPS TL-WA801ND',
        'Marca': 'TP-LINK',
        'Linea': 'REDES',
        'Grupo': 'GENERAL',
        'Existencia': 3,
        'Medida Venta': 'UNIDAD',
        'Precio A': 32.1898,
      },
      {
        'Código': 26925,
        'Producto': 'ACCESS POINT TP-LINK EAP115 300MPBS MONTAJE PARA TECHO',
        'Marca': 'TP-LINK',
        'Linea': 'REDES',
        'Grupo': 'ACTIVO',
        'Existencia': 0,
        'Medida Venta': 'UNIDAD',
        'Precio A': 42.8999,
      },
    ];

    const ws = XLSX.utils.json_to_sheet(combinedRows);

    // Ajustar ancho de columnas para mejor legibilidad
    ws['!cols'] = [
      { wch: 10 },  // Código
      { wch: 55 },  // Producto
      { wch: 15 },  // Marca
      { wch: 12 },  // Linea
      { wch: 12 },  // Grupo (ignorado en importación)
      { wch: 14 },  // Existencia
      { wch: 15 },  // Medida Venta
      { wch: 12 },  // Precio A
    ];

    XLSX.utils.book_append_sheet(workbook, ws, 'Productos');

    const file = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="plantilla-importacion-chpc.xlsx"',
    );
    res.send(file);
  }

  private validateExcelFile(file?: MulterFile): void {
    if (!file) {
      throw new BadRequestException('Debe enviar un archivo .xlsx');
    }

    const isMimeValid = EXCEL_MIME_TYPES.includes(file.mimetype);
    const isNameValid = /\.xlsx$/i.test(file.originalname);

    // ✅ CORREGIDO: Usar OR (||) en lugar de AND (&&)
    // El archivo debe pasar AMBAS validaciones: MIME type correcto Y extensión .xlsx
    if (!isMimeValid || !isNameValid) {
      throw new BadRequestException(
        `Archivo inválido (${file.mimetype}). Solo se permite .xlsx`,
      );
    }
  }
}
