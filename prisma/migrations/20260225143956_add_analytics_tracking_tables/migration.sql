-- CreateTable
CREATE TABLE "page_views" (
    "id" SERIAL NOT NULL,
    "ruta" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "referrer" TEXT,
    "session_id" TEXT,
    "usuario_id" INTEGER,
    "fecha_visita" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "page_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_views" (
    "id" SERIAL NOT NULL,
    "producto_id" INTEGER NOT NULL,
    "producto_nombre" TEXT,
    "marca" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "session_id" TEXT,
    "usuario_id" INTEGER,
    "fecha_visita" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brand_views" (
    "id" SERIAL NOT NULL,
    "marca" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "session_id" TEXT,
    "usuario_id" INTEGER,
    "fecha_visita" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "brand_views_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "page_views_ruta_idx" ON "page_views"("ruta");

-- CreateIndex
CREATE INDEX "page_views_fecha_visita_idx" ON "page_views"("fecha_visita");

-- CreateIndex
CREATE INDEX "page_views_session_id_idx" ON "page_views"("session_id");

-- CreateIndex
CREATE INDEX "page_views_usuario_id_idx" ON "page_views"("usuario_id");

-- CreateIndex
CREATE INDEX "product_views_producto_id_idx" ON "product_views"("producto_id");

-- CreateIndex
CREATE INDEX "product_views_marca_idx" ON "product_views"("marca");

-- CreateIndex
CREATE INDEX "product_views_fecha_visita_idx" ON "product_views"("fecha_visita");

-- CreateIndex
CREATE INDEX "product_views_session_id_idx" ON "product_views"("session_id");

-- CreateIndex
CREATE INDEX "product_views_usuario_id_idx" ON "product_views"("usuario_id");

-- CreateIndex
CREATE INDEX "brand_views_marca_idx" ON "brand_views"("marca");

-- CreateIndex
CREATE INDEX "brand_views_fecha_visita_idx" ON "brand_views"("fecha_visita");

-- CreateIndex
CREATE INDEX "brand_views_session_id_idx" ON "brand_views"("session_id");

-- CreateIndex
CREATE INDEX "brand_views_usuario_id_idx" ON "brand_views"("usuario_id");
