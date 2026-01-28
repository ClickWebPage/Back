-- CreateTable
CREATE TABLE "permisos_temporales" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "tipo_permiso" TEXT NOT NULL,
    "fecha_inicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_expiracion" TIMESTAMP(3) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "otorgado_por" TEXT,
    "razon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permisos_temporales_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "permisos_temporales_user_id_idx" ON "permisos_temporales"("user_id");

-- CreateIndex
CREATE INDEX "permisos_temporales_activo_idx" ON "permisos_temporales"("activo");

-- CreateIndex
CREATE INDEX "permisos_temporales_fecha_expiracion_idx" ON "permisos_temporales"("fecha_expiracion");

-- AddForeignKey
ALTER TABLE "permisos_temporales" ADD CONSTRAINT "permisos_temporales_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
