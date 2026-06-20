const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verificarEstadoProductos() {
  try {
    console.log('🔍 Verificando estado detallado de productos...\n');

    // Contar productos por estado
    const productosActivos = await prisma.product.count({
      where: { activo: true }
    });

    const productosInactivos = await prisma.product.count({
      where: { activo: false }
    });

    const productosDestacados = await prisma.product.count({
      where: { activo: true, destacado: true }
    });

    console.log('📊 Resumen de productos:');
    console.log(`✅ Productos activos: ${productosActivos}`);
    console.log(`❌ Productos inactivos: ${productosInactivos}`);
    console.log(`⭐ Productos destacados: ${productosDestacados}\n`);

    // Obtener algunos productos de muestra
    console.log('📝 Muestra de productos activos:');
    const muestraProductos = await prisma.product.findMany({
      where: { activo: true },
      take: 5,
      select: {
        id: true,
        nombre_producto: true,
        precio: true,
        stock: true,
        categoria: true,
        marca: true,
        activo: true,
        destacado: true
      },
      orderBy: { id: 'asc' }
    });

    muestraProductos.forEach(producto => {
      console.log(`- ${producto.id}: ${producto.nombre_producto}`);
      console.log(`  💰 Precio: $${producto.precio} | 📦 Stock: ${producto.stock}`);
      console.log(`  🏷️ Categoría: ${producto.categoria} | 🏭 Marca: ${producto.marca}`);
      console.log(`  ✅ Activo: ${producto.activo} | ⭐ Destacado: ${producto.destacado}\n`);
    });

    // Verificar categorías disponibles
    console.log('🏷️ Categorías de productos:');
    const categorias = await prisma.product.groupBy({
      by: ['categoria'],
      where: { activo: true },
      _count: { categoria: true },
      orderBy: { categoria: 'asc' }
    });

    categorias.forEach(cat => {
      console.log(`- ${cat.categoria}: ${cat._count.categoria} productos`);
    });

  } catch (error) {
    console.error('❌ Error al verificar productos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarEstadoProductos();