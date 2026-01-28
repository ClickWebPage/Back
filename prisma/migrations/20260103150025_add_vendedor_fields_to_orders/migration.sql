/*
  Warnings:

  - You are about to drop the `wishlist_items` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "EstadoPedido" AS ENUM ('PENDIENTE', 'EN_TRAMITE', 'ATENDIDO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('NUEVO_PEDIDO', 'PEDIDO_ACTUALIZADO', 'PEDIDO_CANCELADO', 'PEDIDO_COMPLETADO');

-- DropForeignKey
ALTER TABLE "wishlist_items" DROP CONSTRAINT "wishlist_items_productId_fkey";

-- DropForeignKey
ALTER TABLE "wishlist_items" DROP CONSTRAINT "wishlist_items_userId_fkey";

-- AlterTable
ALTER TABLE "ordenes" ADD COLUMN     "estado_gestion" "EstadoPedido" NOT NULL DEFAULT 'PENDIENTE',
ADD COLUMN     "vendedor_id" INTEGER,
ADD COLUMN     "vendedor_nombre" TEXT;

-- DropTable
DROP TABLE "wishlist_items";

-- CreateTable
CREATE TABLE "notificaciones" (
    "id" SERIAL NOT NULL,
    "tipo" "NotificationType" NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "orderId" INTEGER,
    "orderCodigo" TEXT,
    "destinatarios" TEXT[],
    "leido_por" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notificaciones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notificaciones_orderId_idx" ON "notificaciones"("orderId");

-- CreateIndex
CREATE INDEX "notificaciones_createdAt_idx" ON "notificaciones"("createdAt");

-- CreateIndex
CREATE INDEX "ordenes_vendedor_id_idx" ON "ordenes"("vendedor_id");

-- CreateIndex
CREATE INDEX "ordenes_estado_gestion_idx" ON "ordenes"("estado_gestion");
