-- Drop legacy bodega columns now consolidated into "Bodega"
ALTER TABLE "Product"
DROP COLUMN IF EXISTS "Almacen",
DROP COLUMN IF EXISTS "Despiece",
DROP COLUMN IF EXISTS "Taller",
DROP COLUMN IF EXISTS "Despiece Garaje",
DROP COLUMN IF EXISTS "Temporal";
