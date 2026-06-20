export interface ImportRowErrorDto {
  sheet: string;
  row: number;
  codigo?: number;
  message: string;
}

export interface ImportPreviewDto {
  ok: boolean;
  sheetsDetected: string[];
  summary: {
    productsRows: number;
    pricesRows: number;
  };
  productsPreview: unknown[];
  pricesPreview: unknown[];
  warnings: string[];
  errors: ImportRowErrorDto[];
}

export interface ImportApplyResultDto {
  ok: boolean;
  insertedProducts: number;
  updatedProducts: number;
  insertedPrices: number;
  updatedPrices: number;
  warnings: string[];
}
