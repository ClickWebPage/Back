-- AlterTable: Add Bodega, Existencia and "Precio A" columns to Product
ALTER TABLE "Product"
ADD COLUMN IF NOT EXISTS "Bodega" VARCHAR(512),
ADD COLUMN IF NOT EXISTS "Existencia" VARCHAR(512),
ADD COLUMN IF NOT EXISTS "Precio A" DOUBLE PRECISION;
