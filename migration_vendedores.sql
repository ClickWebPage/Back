-- Migración para agregar campos de gestión de vendedores a la tabla ordenes
-- Fecha: 2026-01-03

-- Crear el enum para estados de gestión si no existe
DO $$ BEGIN
    CREATE TYPE "EstadoPedido" AS ENUM ('PENDIENTE', 'EN_TRAMITE', 'ATENDIDO', 'CANCELADO');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Agregar columnas nuevas a la tabla ordenes
ALTER TABLE ordenes 
ADD COLUMN IF NOT EXISTS estado_gestion "EstadoPedido" DEFAULT 'PENDIENTE',
ADD COLUMN IF NOT EXISTS vendedor_id INTEGER,
ADD COLUMN IF NOT EXISTS vendedor_nombre VARCHAR(255);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_ordenes_vendedor_id ON ordenes(vendedor_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_estado_gestion ON ordenes(estado_gestion);

-- Actualizar pedidos existentes a estado PENDIENTE si son NULL
UPDATE ordenes SET estado_gestion = 'PENDIENTE' WHERE estado_gestion IS NULL;

-- Comentarios para documentación
COMMENT ON COLUMN ordenes.estado_gestion IS 'Estado de gestión del pedido por vendedores';
COMMENT ON COLUMN ordenes.vendedor_id IS 'ID del vendedor asignado al pedido';
COMMENT ON COLUMN ordenes.vendedor_nombre IS 'Nombre completo del vendedor asignado';

-- Verificar que la migración fue exitosa
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'ordenes' 
AND column_name IN ('estado_gestion', 'vendedor_id', 'vendedor_nombre')
ORDER BY ordinal_position;
