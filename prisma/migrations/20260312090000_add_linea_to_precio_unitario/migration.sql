-- AlterTable: Agregar columna "Linea" a Precio_Unitario para clasificar el producto por línea/categoría
ALTER TABLE "Precio_Unitario"
ADD COLUMN IF NOT EXISTS "Linea" VARCHAR(100);
