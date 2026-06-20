-- CreateTable
CREATE TABLE "garantias_marca" (
    "id" SERIAL NOT NULL,
    "marca" TEXT NOT NULL,
    "meses" INTEGER NOT NULL DEFAULT 6,
    "mensaje" VARCHAR(500) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "garantias_marca_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "garantias_marca_marca_key" ON "garantias_marca"("marca");
