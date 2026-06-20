/*
  Warnings:

  - You are about to drop the `productos` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "banners" DROP CONSTRAINT "banners_producto_id_fkey";

-- DropForeignKey
ALTER TABLE "imagenes" DROP CONSTRAINT "imagenes_producto_id_fkey";

-- DropForeignKey
ALTER TABLE "ordenes_servicio" DROP CONSTRAINT "ordenes_servicio_productId_fkey";

-- DropForeignKey
ALTER TABLE "promociones" DROP CONSTRAINT "promociones_producto_id_fkey";

-- DropTable
DROP TABLE "productos";

-- CreateTable
CREATE TABLE "Product" (
    "Código" INTEGER NOT NULL,
    "Producto" VARCHAR(512),
    "Marca" VARCHAR(512),
    "Medida" VARCHAR(512),
    "Almacen" VARCHAR(512),
    "Garantia" VARCHAR(512),
    "Despiece" VARCHAR(512),
    "Taller" VARCHAR(512),
    "Despiece Garaje" VARCHAR(512),
    "Temporal" VARCHAR(512),
    "Existencia Total" VARCHAR(512),
    "Costo Total" DOUBLE PRECISION,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("Código")
);

-- CreateIndex
CREATE INDEX "Product_Marca_idx" ON "Product"("Marca");

-- AddForeignKey
ALTER TABLE "banners" ADD CONSTRAINT "banners_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "Product"("Código") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_servicio" ADD CONSTRAINT "ordenes_servicio_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("Código") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imagenes" ADD CONSTRAINT "imagenes_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "Product"("Código") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promociones" ADD CONSTRAINT "promociones_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "Product"("Código") ON DELETE CASCADE ON UPDATE CASCADE;
