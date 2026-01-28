# Script de migracion para Panel de Vendedores
# Ejecuta las migraciones de Prisma y actualiza el cliente

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Panel de Vendedores - Migracion" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "prisma/schema.prisma")) {
    Write-Host "[ERROR] No se encontro el archivo schema.prisma" -ForegroundColor Red
    Write-Host "Por favor, ejecuta este script desde el directorio 'backend'" -ForegroundColor Yellow
    exit 1
}

Write-Host "[OK] Directorio correcto encontrado" -ForegroundColor Green
Write-Host ""

# Paso 1: Crear migracion
Write-Host "[PASO 1] Creando migracion de base de datos..." -ForegroundColor Yellow
try {
    npx prisma migrate dev --name add_vendedor_fields_to_orders
    Write-Host "[OK] Migracion creada exitosamente" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Error al crear la migracion" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

Write-Host ""

# Paso 2: Generar cliente Prisma
Write-Host "[PASO 2] Generando cliente de Prisma..." -ForegroundColor Yellow
try {
    npx prisma generate
    Write-Host "[OK] Cliente de Prisma generado exitosamente" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Error al generar el cliente de Prisma" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

Write-Host ""

# Paso 3: Verificar la migracion
Write-Host "[PASO 3] Verificando estado de migraciones..." -ForegroundColor Yellow
try {
    npx prisma migrate status
    Write-Host "[OK] Verificacion completada" -ForegroundColor Green
} catch {
    Write-Host "[ADVERTENCIA] Advertencia al verificar migraciones" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Migracion completada con exito" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Proximos pasos:" -ForegroundColor Yellow
Write-Host "1. Reinicia el servidor backend: npm run start:dev" -ForegroundColor White
Write-Host "2. Accede a /panel-vendedores en el frontend" -ForegroundColor White
Write-Host "3. Inicia sesion como administrador o vendedor" -ForegroundColor White
Write-Host ""
Write-Host "Para mas informacion, consulta: PANEL_VENDEDORES_README.md" -ForegroundColor Cyan
Write-Host "2. Accede a /panel-vendedores en el frontend" -ForegroundColor White
Write-Host "3. Inicia sesión como administrador o vendedor" -ForegroundColor White
Write-Host ""
Write-Host "Para más información, consulta: PANEL_VENDEDORES_README.md" -ForegroundColor Cyan
