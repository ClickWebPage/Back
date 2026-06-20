-- CreateTable
CREATE TABLE "Precio_Unitario" (
    "Código" INTEGER NOT NULL,
    "Producto" VARCHAR(512),
    "Medida" VARCHAR(512),
    "Precio C" DOUBLE PRECISION,
    "Precio B" DOUBLE PRECISION,
    "Precio A" DOUBLE PRECISION,

    CONSTRAINT "Precio_Unitario_pkey" PRIMARY KEY ("Código")
);

-- AddForeignKey
ALTER TABLE "Precio_Unitario" ADD CONSTRAINT "Precio_Unitario_Código_fkey" FOREIGN KEY ("Código") REFERENCES "Product"("Código") ON DELETE CASCADE ON UPDATE CASCADE;
