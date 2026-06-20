/**
 * restore-images-from-disk.js
 *
 * Restaura los registros de la tabla "imagenes" a partir de los archivos
 * .webp que existen físicamente en el disco (UPLOAD_DIR/productos/).
 *
 * Uso:
 *   node restore-images-from-disk.js            → modo simulación (dry-run)
 *   node restore-images-from-disk.js --apply    → escribe en la base de datos
 *   node restore-images-from-disk.js --clean    → borra registros huérfanos antes de restaurar
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// ── Configuración ─────────────────────────────────────────────────────────────
const UPLOAD_DIR = process.env.UPLOAD_DIR
  ? path.join(process.env.UPLOAD_DIR, 'productos')
  : path.join(__dirname, 'public', 'productos');

const DRY_RUN  = !process.argv.includes('--apply');
const CLEAN_DB = process.argv.includes('--clean');

// Patrón de nombre generado por image-optimization.service.ts:
//   producto-{productId}-{nombre}-{timestamp}.webp
const FILE_PATTERN = /^producto-(\d+)-(.+)-(\d+)\.webp$/i;

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatBytes(bytes) {
  if (!bytes) return '?';
  return bytes < 1024 ? `${bytes} B`
    : bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║       RESTAURACIÓN DE IMÁGENES DESDE EL DISCO        ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');

  if (DRY_RUN) {
    console.log('⚠️  MODO SIMULACIÓN (dry-run) — no se escribirá nada en la BD');
    console.log('   Agrega --apply para ejecutar los cambios reales.\n');
  } else {
    console.log('🚀 MODO APLICAR — se escribirán los cambios en la BD\n');
  }

  // 1. Verificar que el directorio de imágenes existe
  if (!fs.existsSync(UPLOAD_DIR)) {
    console.error(`❌ Directorio no encontrado: ${UPLOAD_DIR}`);
    console.error('   Verifica la variable de entorno UPLOAD_DIR o que el volumen esté montado.');
    process.exit(1);
  }
  console.log(`📂 Directorio de imágenes: ${UPLOAD_DIR}\n`);

  // 2. Leer todos los .webp del directorio
  const archivos = fs.readdirSync(UPLOAD_DIR).filter(f => f.endsWith('.webp'));
  console.log(`📸 Archivos .webp encontrados en disco: ${archivos.length}`);

  if (archivos.length === 0) {
    console.log('\n🤷 No hay archivos .webp en el directorio. Nada que restaurar.');
    return;
  }

  // 3. Obtener IDs de productos existentes en la BD
  const productosEnBD = await prisma.product.findMany({ select: { codigo: true } });
  const codigosValidos = new Set(productosEnBD.map(p => p.codigo));
  console.log(`🗄️  Productos en la BD: ${codigosValidos.size}\n`);

  // 4. (Opcional) limpiar registros huérfanos en "imagenes"
  if (CLEAN_DB && !DRY_RUN) {
    console.log('🧹 Limpiando tabla "imagenes" antes de restaurar...');
    const deleted = await prisma.productImage.deleteMany({});
    console.log(`   Eliminados ${deleted.count} registros previos.\n`);
  }

  // 5. Obtener imágenes ya registradas para no duplicar
  const yaRegistradas = await prisma.productImage.findMany({
    select: { nombre_archivo: true }
  });
  const nombresYaEnBD = new Set(yaRegistradas.map(i => i.nombre_archivo));
  console.log(`📋 Imágenes ya registradas en la BD: ${nombresYaEnBD.size}\n`);

  // 6. Analizar archivos y agrupar por productId
  const grupos = {};   // { productId: [{ archivo, stat }] }
  const ignorados = [];

  for (const archivo of archivos) {
    const match = archivo.match(FILE_PATTERN);
    if (!match) {
      ignorados.push({ archivo, motivo: 'nombre no coincide con el patrón esperado' });
      continue;
    }

    const productId = parseInt(match[1], 10);

    if (!codigosValidos.has(productId)) {
      ignorados.push({ archivo, motivo: `producto ID ${productId} no existe en la BD` });
      continue;
    }

    if (nombresYaEnBD.has(archivo)) {
      ignorados.push({ archivo, motivo: 'ya registrado en la BD (se omite)' });
      continue;
    }

    const filePath = path.join(UPLOAD_DIR, archivo);
    const stat = fs.statSync(filePath);

    if (!grupos[productId]) grupos[productId] = [];
    grupos[productId].push({ archivo, tamanio: stat.size });
  }

  const productosARestaurar = Object.keys(grupos).length;
  const imagenesARestaurar  = Object.values(grupos).reduce((acc, imgs) => acc + imgs.length, 0);

  console.log('═══════════════════════════════════════════════════════');
  console.log(`  Productos a restaurar : ${productosARestaurar}`);
  console.log(`  Imágenes a restaurar  : ${imagenesARestaurar}`);
  console.log(`  Ignoradas             : ${ignorados.length}`);
  console.log('═══════════════════════════════════════════════════════\n');

  if (ignorados.length > 0) {
    console.log('⏭️  Archivos ignorados:');
    ignorados.forEach(i => console.log(`   - ${i.archivo}: ${i.motivo}`));
    console.log('');
  }

  if (imagenesARestaurar === 0) {
    console.log('✅ No hay imágenes nuevas que restaurar.');
    return;
  }

  // 7. Insertar registros en la BD
  let insertadas = 0;
  let errores    = 0;

  for (const [productIdStr, imagenes] of Object.entries(grupos)) {
    const productId = parseInt(productIdStr, 10);

    // Ordenar por timestamp en el nombre (más antiguo primero → es_principal)
    imagenes.sort((a, b) => {
      const tsA = parseInt(a.archivo.match(/(\d+)\.webp$/)?.[1] ?? '0', 10);
      const tsB = parseInt(b.archivo.match(/(\d+)\.webp$/)?.[1] ?? '0', 10);
      return tsA - tsB;
    });

    for (let i = 0; i < imagenes.length; i++) {
      const { archivo, tamanio } = imagenes[i];
      const rutaImagen = `/uploads/productos/${archivo}`;
      const esPrincipal = i === 0;

      console.log(
        `  ${DRY_RUN ? '[SIMULADO]' : '[INSERTANDO]'} ` +
        `Producto ${productId} | ${archivo} | ${formatBytes(tamanio)} | ` +
        `principal=${esPrincipal}`
      );

      if (!DRY_RUN) {
        try {
          await prisma.productImage.create({
            data: {
              producto_id:        productId,
              ruta_imagen:        rutaImagen,
              nombre_archivo:     archivo,
              tipo_archivo:       'image/webp',
              tamano_archivo:     tamanio,
              es_principal:       esPrincipal,
              orden:              i,
              version_optimizada: true,
              fecha_subida:       new Date(),
            },
          });
          insertadas++;
        } catch (err) {
          console.error(`   ❌ Error insertando ${archivo}: ${err.message}`);
          errores++;
        }
      } else {
        insertadas++;
      }
    }
  }

  // 8. Resumen final
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║                     RESUMEN FINAL                    ║');
  console.log('╠══════════════════════════════════════════════════════╣');
  console.log(`║  Productos procesados : ${String(productosARestaurar).padEnd(28)}║`);
  console.log(`║  Imágenes insertadas  : ${String(insertadas).padEnd(28)}║`);
  console.log(`║  Errores              : ${String(errores).padEnd(28)}║`);
  if (DRY_RUN) {
    console.log('║                                                      ║');
    console.log('║  ⚠️  Dry-run: ejecuta con --apply para aplicar        ║');
  }
  console.log('╚══════════════════════════════════════════════════════╝\n');
}

main()
  .catch(err => {
    console.error('❌ Error fatal:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
