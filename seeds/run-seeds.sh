#!/bin/sh
# ==============================================
# Script para ejecutar seeds en Dokploy
# ==============================================
# Uso desde la consola/terminal de Dokploy:
#   ./run-seeds.sh              → Ejecuta TODOS los seeds
#   ./run-seeds.sh users        → Solo usuarios
#   ./run-seeds.sh products     → Solo productos (desde archivo SQL)
#   ./run-seeds.sh products-demo → Productos demo (hardcoded)
#   ./run-seeds.sh precios      → Solo precios unitarios
#   ./run-seeds.sh banners      → Solo banners
#   ./run-seeds.sh garantias    → Solo garantías
#   ./run-seeds.sh work-orders  → Solo work orders
# ==============================================

set -e

echo "=============================================="
echo "  CHPC - Database Seeder"
echo "=============================================="
echo ""

# Verificar conexión a la base de datos
echo ">> Verificando conexión a la base de datos..."
echo "SELECT 1;" | npx prisma db execute --stdin > /dev/null 2>&1 && echo "   ✅ Conexión exitosa" || {
    echo "   ❌ No se pudo conectar a la base de datos"
    echo "   Verifica que DATABASE_URL esté configurado correctamente"
    exit 1
}

# Función para ejecutar un seed individual
run_seed() {
    local seed_name=$1
    local seed_file=$2

    echo ""
    echo ">> Ejecutando: $seed_name"
    echo "   Archivo: $seed_file"

    if [ -f "$seed_file" ]; then
        node "$seed_file"
        echo "   ✅ $seed_name completado"
    else
        echo "   ❌ Archivo no encontrado: $seed_file"
        return 1
    fi
}

# Determinar qué seeds ejecutar
SEED_TARGET=${1:-all}

case "$SEED_TARGET" in
    users)
        run_seed "Usuarios" "seed-users.js"
        ;;
    products)
        run_seed "Productos (SQL)" "seed-product.js"
        ;;
    products-demo)
        run_seed "Productos (Demo)" "seed-products.js"
        ;;
    precios)
        run_seed "Precios Unitarios" "seed-precios-unitarios.js"
        ;;
    banners)
        run_seed "Banners" "seed-banners.js"
        ;;
    garantias)
        run_seed "Garantías" "seed-garantias.js"
        ;;
    work-orders)
        run_seed "Work Orders" "seed-work-orders.js"
        ;;
    all)
        echo ">> Ejecutando TODOS los seeds en orden..."
        echo ""

        # 1. Usuarios primero (necesarios para FK en work orders)
        run_seed "1/6 - Usuarios" "seed-users.js"

        # 2. Productos (desde archivo SQL si existe, sino demo)
        if [ -f "Inserciones_Product.txt" ]; then
            run_seed "2/6 - Productos (SQL)" "seed-product.js"
        else
            run_seed "2/6 - Productos (Demo)" "seed-products.js"
        fi

        # 3. Precios unitarios (depende de productos)
        if [ -f "Inserciones_Precio_unitario.txt" ]; then
            run_seed "3/6 - Precios Unitarios" "seed-precios-unitarios.js"
        else
            echo ""
            echo ">> 3/6 - Precios Unitarios: OMITIDO (archivo SQL no encontrado)"
        fi

        # 4. Banners
        run_seed "4/6 - Banners" "seed-banners.js"

        # 5. Garantías
        run_seed "5/6 - Garantías" "seed-garantias.js"

        # 6. Work Orders
        run_seed "6/6 - Work Orders" "seed-work-orders.js"

        echo ""
        echo "=============================================="
        echo "  ✅ TODOS los seeds ejecutados exitosamente"
        echo "=============================================="
        ;;
    *)
        echo "❌ Opción no reconocida: $SEED_TARGET"
        echo ""
        echo "Opciones disponibles:"
        echo "  all           - Ejecutar todos los seeds"
        echo "  users         - Solo usuarios"
        echo "  products      - Productos desde archivo SQL"
        echo "  products-demo - Productos demo (hardcoded)"
        echo "  precios       - Precios unitarios"
        echo "  banners       - Banners"
        echo "  garantias     - Garantías"
        echo "  work-orders   - Work Orders"
        exit 1
        ;;
esac

echo ""
echo "🎉 Seed finalizado."
