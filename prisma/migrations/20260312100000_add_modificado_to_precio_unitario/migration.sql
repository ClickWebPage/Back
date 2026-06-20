-- AlterTable: Agregar columna "Modificado" a Precio_Unitario para registrar la última fecha de modificación de precio
ALTER TABLE "Precio_Unitario"
ADD COLUMN IF NOT EXISTS "Modificado" VARCHAR(50);
