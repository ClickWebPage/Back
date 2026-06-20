-- Migración: Crear tabla de garantías por marca
-- Ejecutar este script si la migración automática de Prisma no está disponible

-- CreateTable
CREATE TABLE IF NOT EXISTS "garantias_marca" (
    "id" SERIAL NOT NULL,
    "marca" VARCHAR(255) NOT NULL,
    "meses" INTEGER NOT NULL DEFAULT 6,
    "mensaje" VARCHAR(500) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "garantias_marca_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "garantias_marca_marca_key" ON "garantias_marca"("marca");

-- Datos de ejemplo (opcional - descomenta las líneas que necesites)
/*
INSERT INTO "garantias_marca" ("marca", "meses", "mensaje", "activo", "updatedAt") VALUES
('ASUS', 12, 'Garantía oficial ASUS de 12 meses', true, NOW()),
('MSI', 24, 'Garantía MSI de 2 años en componentes', true, NOW()),
('AMD', 36, 'Garantía AMD de 3 años', true, NOW()),
('Intel', 36, 'Garantía Intel de 3 años', true, NOW()),
('NVIDIA', 12, 'Garantía de 12 meses en tarjetas gráficas', true, NOW()),
('Corsair', 24, 'Garantía Corsair de 2 años', true, NOW()),
('Kingston', 60, 'Garantía Kingston de 5 años en memorias', true, NOW()),
('Logitech', 24, 'Garantía Logitech de 2 años', true, NOW()),
('Razer', 24, 'Garantía Razer de 2 años', true, NOW()),
('Samsung', 12, 'Garantía Samsung de 1 año', true, NOW()),
('Western Digital', 24, 'Garantía WD de 2 años', true, NOW()),
('Seagate', 24, 'Garantía Seagate de 2 años', true, NOW()),
('TP-Link', 12, 'Garantía TP-Link de 1 año', true, NOW()),
('HP', 12, 'Garantía HP de 1 año', true, NOW()),
('Dell', 12, 'Garantía Dell de 1 año', true, NOW()),
('Lenovo', 12, 'Garantía Lenovo de 1 año', true, NOW()),
('Acer', 12, 'Garantía Acer de 1 año', true, NOW());
*/
