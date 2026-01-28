/*
  Warnings:

  - You are about to drop the `ServiceTicket` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "WorkOrderStatus" AS ENUM ('EN_ESPERA', 'EN_REVISION', 'REPARADO', 'ENTREGADO', 'SIN_REPARACION', 'CANCELADO');

-- DropTable
DROP TABLE "ServiceTicket";

-- DropEnum
DROP TYPE "TicketStatus";

-- CreateTable
CREATE TABLE "ordenes_trabajo" (
    "id" SERIAL NOT NULL,
    "trackingId" TEXT NOT NULL,
    "cliente_nombre" TEXT NOT NULL,
    "cliente_telefono" TEXT NOT NULL,
    "cliente_email" TEXT,
    "marca_equipo" TEXT NOT NULL,
    "modelo_equipo" TEXT NOT NULL,
    "numero_serie" TEXT,
    "descripcion_problema" TEXT NOT NULL,
    "notas_tecnicas" TEXT,
    "estado" "WorkOrderStatus" NOT NULL DEFAULT 'EN_ESPERA',
    "costo_estimado" DOUBLE PRECISION DEFAULT 0,
    "costo_final" DOUBLE PRECISION,
    "tecnico_id" INTEGER,
    "tecnico_nombre" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,
    "fecha_entrega" TIMESTAMP(3),
    "userId" INTEGER,

    CONSTRAINT "ordenes_trabajo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ordenes_trabajo_trackingId_key" ON "ordenes_trabajo"("trackingId");

-- CreateIndex
CREATE INDEX "ordenes_trabajo_trackingId_idx" ON "ordenes_trabajo"("trackingId");

-- CreateIndex
CREATE INDEX "ordenes_trabajo_estado_idx" ON "ordenes_trabajo"("estado");

-- CreateIndex
CREATE INDEX "ordenes_trabajo_tecnico_id_idx" ON "ordenes_trabajo"("tecnico_id");

-- CreateIndex
CREATE INDEX "ordenes_trabajo_fecha_creacion_idx" ON "ordenes_trabajo"("fecha_creacion");

-- AddForeignKey
ALTER TABLE "ordenes_trabajo" ADD CONSTRAINT "ordenes_trabajo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
