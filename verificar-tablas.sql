-- Verificar todas las tablas creadas en PostgreSQL
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Ver detalles de la tabla de promociones
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'promociones';

-- Ver detalles de la tabla de configuración del sitio
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'configuracion_sitio';
