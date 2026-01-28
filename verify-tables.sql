-- Verificar todas las tablas en el schema público
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Ver estructura de la tabla promociones
\d promociones

-- Ver estructura de la tabla configuracion_sitio
\d configuracion_sitio

-- Contar registros en cada tabla
SELECT 
    'usuarios' as tabla, COUNT(*) as registros FROM usuarios
UNION ALL
SELECT 'productos', COUNT(*) FROM productos
UNION ALL
SELECT 'banners', COUNT(*) FROM banners
UNION ALL
SELECT 'promociones', COUNT(*) FROM promociones
UNION ALL
SELECT 'configuracion_sitio', COUNT(*) FROM configuracion_sitio
UNION ALL
SELECT 'ordenes', COUNT(*) FROM ordenes;
