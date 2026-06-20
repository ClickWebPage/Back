import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as XLSX from 'xlsx';
import {
  ImportApplyResultDto,
  ImportPreviewDto,
  ImportRowErrorDto,
} from './dto/import-result.dto';

// Columnas de la hoja única consolidada:
// Código | Producto | Marca | Linea | Grupo | Existencia | Medida Venta | Precio A
interface ProductImportRow {
  codigo: number;
  producto?: string;
  marca?: string;
  medida?: string;
  existenciaTotal?: string;
  precioA?: number;
}

interface PriceImportRow {
  codigo: number;
  producto?: string;
  medida?: string;
  linea?: string;
  precioA?: number;
}

interface ParsedWorkbook {
  sheetsDetected: string[];
  productsRows: ProductImportRow[];
  pricesRows: PriceImportRow[];
  errors: ImportRowErrorDto[];
  warnings: string[];
}

@Injectable()
export class ExcelImportService {
  constructor(private readonly prisma: PrismaService) {}

  async previewImport(fileBuffer: Buffer): Promise<ImportPreviewDto> {
    const parsed = this.parseWorkbook(fileBuffer);

    return {
      ok: parsed.errors.length === 0,
      sheetsDetected: parsed.sheetsDetected,
      summary: {
        productsRows: parsed.productsRows.length,
        pricesRows: parsed.pricesRows.length,
      },
      productsPreview: parsed.productsRows.slice(0, 15),
      pricesPreview: parsed.pricesRows.slice(0, 15),
      warnings: parsed.warnings,
      errors: parsed.errors,
    };
  }

  async applyImport(fileBuffer: Buffer): Promise<ImportApplyResultDto> {
    const parsed = this.parseWorkbook(fileBuffer);

    if (parsed.errors.length > 0) {
      throw new BadRequestException({
        message: 'El archivo contiene errores de validación',
        errors: parsed.errors,
      });
    }

    if (parsed.productsRows.length === 0) {
      throw new BadRequestException(
        'No se encontraron filas válidas para importar',
      );
    }

    const productCodes = Array.from(
      new Set(parsed.productsRows.map((row) => row.codigo)),
    );
    const priceCodes = Array.from(
      new Set(parsed.pricesRows.map((row) => row.codigo)),
    );

    // Pre-query existentes ANTES de la transacción para clasificar creates vs updates
    const [existingProducts, existingPrices] = await Promise.all([
      productCodes.length > 0
        ? this.prisma.product.findMany({
            where: { codigo: { in: productCodes } },
            select: { codigo: true },
          })
        : Promise.resolve([]),
      priceCodes.length > 0
        ? this.prisma.precioUnitario.findMany({
            where: { codigo: { in: priceCodes } },
            select: { codigo: true },
          })
        : Promise.resolve([]),
    ]);

    const existingProductSet = new Set(existingProducts.map((p) => p.codigo));
    const existingPriceSet = new Set(existingPrices.map((p) => p.codigo));

    const productsToCreate = parsed.productsRows.filter(
      (r) => !existingProductSet.has(r.codigo),
    );
    const productsToUpdate = parsed.productsRows.filter((r) =>
      existingProductSet.has(r.codigo),
    );
    const pricesToCreate = parsed.pricesRows.filter(
      (r) => !existingPriceSet.has(r.codigo),
    );
    const pricesToUpdate = parsed.pricesRows.filter((r) =>
      existingPriceSet.has(r.codigo),
    );

    try {
      await this.prisma.$transaction(
        async (tx) => {
          // 1. Crear productos nuevos en batch
          if (productsToCreate.length > 0) {
            await tx.product.createMany({
              data: productsToCreate.map((row) =>
                this.cleanUndefined({
                  codigo: row.codigo,
                  producto: row.producto,
                  marca: row.marca,
                  medida: row.medida,
                  existenciaTotal: row.existenciaTotal,
                  precioA: row.precioA,
                }),
              ),
              skipDuplicates: true,
            });
          }

          // 2. Actualizar productos existentes en batch (individual, necesario para WHERE distintos)
          for (const row of productsToUpdate) {
            await tx.product.update({
              where: { codigo: row.codigo },
              data: this.cleanUndefined({
                producto: row.producto,
                marca: row.marca,
                medida: row.medida,
                existenciaTotal: row.existenciaTotal,
                precioA: row.precioA,
              }),
            });
          }

          // 3. Crear precios nuevos en batch (productos ya existen tras paso 1)
          if (pricesToCreate.length > 0) {
            await tx.precioUnitario.createMany({
              data: pricesToCreate.map((row) =>
                this.cleanUndefined({
                  codigo: row.codigo,
                  producto: row.producto,
                  medida: row.medida,
                  linea: row.linea,
                  precioA: row.precioA,
                }),
              ),
              skipDuplicates: true,
            });
          }

          // 4. Actualizar precios existentes
          for (const row of pricesToUpdate) {
            await tx.precioUnitario.update({
              where: { codigo: row.codigo },
              data: this.cleanUndefined({
                producto: row.producto,
                medida: row.medida,
                linea: row.linea,
                precioA: row.precioA,
              }),
            });
          }
        },
        { timeout: 120_000, maxWait: 15_000 },
      );
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      const msg =
        error instanceof Error ? error.message : 'Error desconocido en la base de datos';
      throw new InternalServerErrorException(
        `Error al aplicar la importación: ${msg}`,
      );
    }

    return {
      ok: true,
      insertedProducts: productsToCreate.length,
      updatedProducts: productsToUpdate.length,
      insertedPrices: pricesToCreate.length,
      updatedPrices: pricesToUpdate.length,
      warnings: parsed.warnings,
    };
  }

  private parseWorkbook(fileBuffer: Buffer): ParsedWorkbook {
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetsDetected = workbook.SheetNames;

    if (sheetsDetected.length === 0) {
      throw new BadRequestException('El archivo Excel no contiene hojas.');
    }

    // Preferir hoja llamada "Productos"; si no existe, tomar la primera disponible
    const normalizedNames = sheetsDetected.map((n) => this.normalizeKey(n));
    const preferredIdx = normalizedNames.findIndex((n) => n === 'productos');
    const sheetName =
      preferredIdx >= 0 ? sheetsDetected[preferredIdx] : sheetsDetected[0];

    const worksheet = workbook.Sheets[sheetName];
    const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
      defval: null,
      raw: false,
    });

    const errors: ImportRowErrorDto[] = [];
    const warnings: string[] = [];
    const productsRows: ProductImportRow[] = [];
    const pricesRows: PriceImportRow[] = [];

    if (rawRows.length === 0) {
      throw new BadRequestException(
        `La hoja "${sheetName}" está vacía. Agrega filas con datos.`,
      );
    }

    // Validar que existe la columna Código
    const firstRow = this.normalizeRow(rawRows[0]);
    if (!Object.keys(firstRow).includes('codigo')) {
      throw new BadRequestException(
        `La hoja "${sheetName}" no tiene columna "Código". ` +
          'Descargá la plantilla para ver el formato correcto.',
      );
    }

    rawRows.forEach((rawRow, index) => {
      if (this.isEmptyRow(rawRow)) return;

      const row = this.normalizeRow(rawRow);
      const excelRow = index + 2;
      const codigo = this.toInt(row.codigo);

      if (!codigo) {
        errors.push({
          sheet: sheetName,
          row: excelRow,
          message: 'La columna Código es obligatoria y debe ser numérica',
        });
        return;
      }

      // Medida Venta (columna combinada) → medida en Product y PrecioUnitario
      const medida = this.toText(row.medidaventa ?? row.medida);

      // Existencia → existenciaTotal en Product
      const existenciaTotal = this.toText(
        row.existencia ?? row.existencias ?? row.existenciatotal,
      );

      const precioA = this.toNumber(row.precioa ?? row.precio_a);

      productsRows.push({
        codigo,
        producto: this.toText(row.producto),
        marca: this.toText(row.marca),
        medida,
        existenciaTotal,
        precioA,
      });

      // Solo registrar precio si viene Precio A en la fila
      if (precioA !== undefined) {
        pricesRows.push({
          codigo,
          producto: this.toText(row.producto),
          medida,
          linea: this.toText(row.linea),
          precioA,
        });
      }
    });

    if (sheetsDetected.length > 1) {
      warnings.push(
        `Se procesó únicamente la hoja "${sheetName}". ` +
          'El sistema utiliza formato de hoja única consolidada.',
      );
    }

    return { sheetsDetected, productsRows, pricesRows, errors, warnings };
  }

  private cleanUndefined<T extends Record<string, unknown>>(obj: T): T {
    const clean = Object.entries(obj).filter(([, value]) => value !== undefined);
    return Object.fromEntries(clean) as T;
  }

  private normalizeRow(row: Record<string, unknown>): Record<string, unknown> {
    const normalized: Record<string, unknown> = {};

    // ✅ MEJORADO: Mapeo inteligente de columnas con sinónimos conocidos
    // Esto permite que el sistema reconozca variaciones en nombres de columnas
    const columnAliases: Record<string, string[]> = {
      codigo: ['código', 'code', 'sku', 'id', 'codigodelproducto'],
      producto: ['product', 'nombre_producto', 'name', 'descripcion'],
      marca: ['brand', 'fabricante'],
      medida: ['medida venta', 'measure', 'unit', 'medidaventa', 'unidad'],
      medidaventa: ['medida venta', 'measure', 'unit', 'medida'],
      existencia: ['existencias', 'existencia total', 'stock', 'qty', 'cantidad', 'existenciatotal'],
      precioa: ['precio a', 'price a', 'precio', 'priceb', 'precioa'],
      linea: ['line', 'línea', 'categoria', 'category'],
      grupo: ['group', 'groupo'],
    };

    for (const [key, value] of Object.entries(row)) {
      const normalizedKey = this.normalizeKey(key);
      let matched = normalizedKey;

      // Buscar si es un alias conocido
      for (const [canonical, aliases] of Object.entries(columnAliases)) {
        if (
          aliases.some((alias) => this.normalizeKey(alias) === normalizedKey) ||
          this.normalizeKey(canonical) === normalizedKey
        ) {
          matched = canonical;
          break;
        }
      }

      normalized[matched] = value;
    }

    return normalized;
  }

  private normalizeKey(key: string): string {
    return key
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
  }

  private isEmptyRow(row: Record<string, unknown>): boolean {
    return Object.values(row).every((value) => {
      if (value === null || value === undefined) return true;
      if (typeof value === 'string') return value.trim() === '';
      return false;
    });
  }

  private toText(value: unknown): string | undefined {
    if (value === null || value === undefined) return undefined;
    const text = String(value).trim();
    return text === '' ? undefined : text;
  }

  private toInt(value: unknown): number | undefined {
    if (value === null || value === undefined || value === '') {
      return undefined;
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      return Math.trunc(value);
    }

    // ✅ CORREGIDO: No permitir caracteres negativos en códigos de producto
    const normalized = String(value).replace(/[^0-9]/g, '').trim();
    if (normalized === '') {
      return undefined;
    }

    const parsed = Number.parseInt(normalized, 10);
    // Validar que sea un número válido y positivo (el código nunca debe ser negativo)
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return undefined;
    }
    return parsed;
  }

  private toNumber(value: unknown): number | undefined {
    if (value === null || value === undefined || value === '') {
      return undefined;
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    let text = String(value).trim();
    if (text === '') {
      return undefined;
    }

    text = text.replace(/\s/g, '').replace(/[^0-9,.-]/g, '');

    const hasComma = text.includes(',');
    const hasDot = text.includes('.');

    if (hasComma && hasDot) {
      const lastComma = text.lastIndexOf(',');
      const lastDot = text.lastIndexOf('.');

      if (lastComma > lastDot) {
        text = text.replace(/\./g, '').replace(',', '.');
      } else {
        text = text.replace(/,/g, '');
      }
    } else if (hasComma) {
      text = text.replace(',', '.');
    }

    const parsed = Number.parseFloat(text);
    // ✅ Permitir números negativos - compatible con sistema de facturación
    return Number.isFinite(parsed) ? parsed : undefined;
  }
}
