// Script para corregir rutas de imágenes en la base de datos
// Ejecutar: node fix-image-paths.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixImagePaths() {
  console.log('🔧 Iniciando corrección de rutas de imágenes...\n');
  console.log('ℹ️  Tabla en BD: "imagenes" (@@map en schema.prisma)\n');

  try {
    // Obtener todas las imágenes con rutas incorrectas
    const imagenes = await prisma.productImage.findMany({
      where: {
        OR: [
          { ruta_imagen: { startsWith: '/Productos/' } },
          { ruta_imagen: { not: { startsWith: '/uploads/' } } }
        ]
      }
    });

    console.log(`📊 Encontradas ${imagenes.length} imágenes con rutas incorrectas\n`);

    let actualizadas = 0;
    let errores = 0;

    for (const imagen of imagenes) {
      try {
        let nuevaRuta = imagen.ruta_imagen;

        // Corregir rutas que empiezan con /Productos/
        if (nuevaRuta.startsWith('/Productos/')) {
          nuevaRuta = nuevaRuta.replace('/Productos/', '/uploads/productos/');
        }
        // Corregir rutas que no tienen el prefijo correcto
        else if (!nuevaRuta.startsWith('/uploads/')) {
          // Extraer solo el nombre del archivo
          const fileName = nuevaRuta.split('/').pop();
          nuevaRuta = `/uploads/productos/${fileName}`;
        }

        // Actualizar en la base de datos
        await prisma.productImage.update({
          where: { id: imagen.id },
          data: { ruta_imagen: nuevaRuta }
        });

        console.log(`✅ [${imagen.id}] ${imagen.ruta_imagen} → ${nuevaRuta}`);
        actualizadas++;

      } catch (error) {
        console.error(`❌ Error actualizando imagen ${imagen.id}:`, error.message);
        errores++;
      }
    }

    console.log(`\n📈 Resumen:`);
    console.log(`   - Total encontradas: ${imagenes.length}`);
    console.log(`   - Actualizadas: ${actualizadas}`);
    console.log(`   - Errores: ${errores}`);
    console.log(`\n✅ Corrección completada`);

  } catch (error) {
    console.error('❌ Error general:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar
fixImagePaths()
  .catch(console.error);
