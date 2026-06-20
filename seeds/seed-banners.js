const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const banners = [
  {
    titulo: 'Banner Promocional 1',
    imagen_url: '/Banners/banner1.webp',
    producto_id: null, // Sin producto asociado por ahora
  },
  {
    titulo: 'Banner Promocional 2',
    imagen_url: '/Banners/banner2.avif',
    producto_id: null,
  },
  {
    titulo: 'Banner Promocional 3',
    imagen_url: '/Banners/Banner3.jpg',
    producto_id: null,
  },
  {
    titulo: 'Banner Promocional 4',
    imagen_url: '/Banners/Banner4.png',
    producto_id: null,
  },
  {
    titulo: 'Banner Promocional 5',
    imagen_url: '/Banners/Banner5.jpg',
    producto_id: null,
  },
];

async function main() {
  console.log('🎨 Iniciando seeding de banners...');

  // Primero, eliminar banners existentes (opcional)
  const deleteResult = await prisma.banner.deleteMany({});
  console.log(`🗑️  Eliminados ${deleteResult.count} banners existentes`);

  // Insertar los nuevos banners
  for (const banner of banners) {
    const created = await prisma.banner.create({
      data: banner,
    });
    console.log(`✅ Banner creado: ${created.titulo} (ID: ${created.id})`);
  }

  console.log(`\n🎉 Seeding completado: ${banners.length} banners insertados`);
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
