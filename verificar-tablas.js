const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verificarTablas() {
  try {
    console.log('🔍 Verificando tablas en la base de datos...\n');

    // Verificar tabla usuarios
    const usuarios = await prisma.user.count();
    console.log('✅ Tabla usuarios:', usuarios, 'registros');

    // Verificar tabla productos
    const productos = await prisma.product.count();
    console.log('✅ Tabla productos:', productos, 'registros');

    // Verificar tabla banners
    const banners = await prisma.banner.count();
    console.log('✅ Tabla banners:', banners, 'registros');

    // Verificar tabla promociones (nueva)
    try {
      const promociones = await prisma.promotion.count();
      console.log('✅ Tabla promociones:', promociones, 'registros');
    } catch (e) {
      console.log('❌ Tabla promociones: NO EXISTE');
    }

    // Verificar tabla configuracion_sitio (nueva)
    try {
      const configs = await prisma.siteConfig.count();
      console.log('✅ Tabla configuracion_sitio:', configs, 'registros');
    } catch (e) {
      console.log('❌ Tabla configuracion_sitio: NO EXISTE');
    }

    // Verificar tabla ordenes
    const ordenes = await prisma.order.count();
    console.log('✅ Tabla ordenes:', ordenes, 'registros');

    // Verificar tabla wishlist_items
    const wishlist = await prisma.wishlistItem.count();
    console.log('✅ Tabla wishlist_items:', wishlist, 'registros');

    // Verificar tabla ordenes_servicio
    const servicios = await prisma.serviceOrder.count();
    console.log('✅ Tabla ordenes_servicio:', servicios, 'registros');

    // Verificar tabla imagenes
    const imagenes = await prisma.productImage.count();
    console.log('✅ Tabla imagenes:', imagenes, 'registros');

    console.log('\n✨ Verificación completa');

  } catch (error) {
    console.error('❌ Error al verificar tablas:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verificarTablas();
