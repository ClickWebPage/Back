# Script para configurar la base de datos con Prisma
# Este script aplica las migraciones y puebla la base de datos con productos de prueba

Write-Host "Configurando base de datos..." -ForegroundColor Cyan
Write-Host ""

# Paso 1: Generar el cliente de Prisma
Write-Host "Generando cliente de Prisma..." -ForegroundColor Yellow
npx prisma generate

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al generar el cliente de Prisma" -ForegroundColor Red
    exit 1
}

Write-Host "Cliente de Prisma generado correctamente" -ForegroundColor Green
Write-Host ""

# Paso 2: Crear y aplicar la migración
Write-Host "Creando migracion..." -ForegroundColor Yellow
npx prisma migrate dev --name "add_product_fields_for_testing"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al crear la migracion" -ForegroundColor Red
    exit 1
}

Write-Host "Migracion aplicada correctamente" -ForegroundColor Green
Write-Host ""

# Paso 3: Poblar la base de datos con productos de prueba
Write-Host "Poblando base de datos con productos de prueba..." -ForegroundColor Yellow
node seed-products.js

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al poblar la base de datos" -ForegroundColor Red
    exit 1
}

Write-Host "Base de datos poblada correctamente" -ForegroundColor Green
Write-Host ""

# Paso 4: Verificar los datos
Write-Host "Datos insertados correctamente" -ForegroundColor Yellow
Write-Host "Puedes abrir Prisma Studio en http://localhost:5555 para ver los datos" -ForegroundColor Green
Write-Host "Ejecuta: npx prisma studio" -ForegroundColor Cyan
Write-Host ""

Write-Host "Configuracion completada exitosamente!" -ForegroundColor Green
Write-Host ""
Write-Host "Proximos pasos:" -ForegroundColor Cyan
Write-Host "  1. Inicia el servidor backend: npm run start:dev" -ForegroundColor White
Write-Host "  2. Inicia el frontend: npm run serve (desde la carpeta raiz del frontend)" -ForegroundColor White
Write-Host "  3. Los productos ya estan disponibles en tu base de datos" -ForegroundColor White
Write-Host ""
