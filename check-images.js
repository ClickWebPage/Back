const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkImages() {
  try {
    const images = await prisma.productImage.findMany({
      include: {
        producto: {
          select: {
            id: true,
            nombre_producto: true
          }
        }
      }
    });
    
    console.log('\n=== IMÁGENES EN BASE DE DATOS ===');
    console.log(`Total de imágenes: ${images.length}\n`);
    
    if (images.length === 0) {
      console.log('❌ No hay imágenes registradas en la base de datos');
    } else {
      images.forEach((img, index) => {
        console.log(`${index + 1}. Imagen ID: ${img.id}`);
        console.log(`   Producto: ${img.producto?.nombre_producto || 'N/A'} (ID: ${img.producto_id})`);
        console.log(`   Ruta: ${img.ruta_imagen}`);
        console.log(`   Principal: ${img.es_principal ? 'Sí' : 'No'}`);
        console.log(`   Orden: ${img.orden}`);
        console.log(`   Fecha: ${img.fecha_subida}`);
        console.log('');
      });
    }
  } catch (error) {
    console.error('Error al consultar imágenes:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkImages();
