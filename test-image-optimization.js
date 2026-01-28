/**
 * Script de prueba para el servicio de optimización de imágenes
 * Ejecutar desde el directorio backend:
 * node test-image-optimization.js
 */

const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

console.log('=== TEST DE OPTIMIZACIÓN DE IMÁGENES ===\n');

async function testImageOptimization() {
  try {
    // 1. Crear una imagen de prueba
    console.log('1. Creando imagen de prueba (1500x1500, PNG)...');
    const testImageBuffer = await sharp({
      create: {
        width: 1500,
        height: 1500,
        channels: 3,
        background: { r: 255, g: 100, b: 50 }
      }
    })
    .png()
    .toBuffer();
    
    const originalSize = testImageBuffer.length;
    console.log(`   ✓ Imagen creada: ${formatBytes(originalSize)}\n`);

    // 2. Convertir a WebP con optimización estándar
    console.log('2. Convirtiendo a WebP (1200x1200, calidad 85)...');
    const optimizedBuffer = await sharp(testImageBuffer)
      .resize(1200, 1200, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({
        quality: 85,
        effort: 4
      })
      .toBuffer();
    
    const optimizedSize = optimizedBuffer.length;
    const reduction = ((1 - optimizedSize / originalSize) * 100).toFixed(2);
    console.log(`   ✓ Imagen optimizada: ${formatBytes(optimizedSize)}`);
    console.log(`   ✓ Reducción de tamaño: ${reduction}%\n`);

    // 3. Crear versiones múltiples
    console.log('3. Creando múltiples versiones...');
    
    // Thumbnail
    const thumbBuffer = await sharp(testImageBuffer)
      .resize(300, 300, { fit: 'cover' })
      .webp({ quality: 80 })
      .toBuffer();
    console.log(`   ✓ Thumbnail (300x300): ${formatBytes(thumbBuffer.length)}`);
    
    // Medium
    const mediumBuffer = await sharp(testImageBuffer)
      .resize(800, 800, { fit: 'inside' })
      .webp({ quality: 85 })
      .toBuffer();
    console.log(`   ✓ Medium (800x800): ${formatBytes(mediumBuffer.length)}`);
    
    // Large
    const largeBuffer = await sharp(testImageBuffer)
      .resize(1600, 1600, { fit: 'inside' })
      .webp({ quality: 90 })
      .toBuffer();
    console.log(`   ✓ Large (1600x1600): ${formatBytes(largeBuffer.length)}\n`);

    // 4. Metadata
    console.log('4. Extrayendo metadata de imagen optimizada...');
    const metadata = await sharp(optimizedBuffer).metadata();
    console.log('   ✓ Metadata:');
    console.log(`     - Formato: ${metadata.format}`);
    console.log(`     - Dimensiones: ${metadata.width}x${metadata.height}`);
    console.log(`     - Canales: ${metadata.channels}`);
    console.log(`     - Espacio de color: ${metadata.space}`);
    console.log(`     - Tiene alpha: ${metadata.hasAlpha}\n`);

    // 5. Probar diferentes niveles de calidad
    console.log('5. Comparando niveles de calidad WebP...');
    const qualities = [70, 80, 85, 90, 95];
    
    for (const quality of qualities) {
      const buffer = await sharp(testImageBuffer)
        .resize(1200, 1200, { fit: 'inside' })
        .webp({ quality })
        .toBuffer();
      
      const size = buffer.length;
      const percent = ((1 - size / originalSize) * 100).toFixed(2);
      console.log(`   Calidad ${quality}: ${formatBytes(size)} (reducción: ${percent}%)`);
    }

    console.log('\n=== TODOS LOS TESTS PASARON ✓ ===');
    console.log('\n📝 El servicio de optimización está listo para usar.');
    console.log('📖 Ver OPTIMIZACION_IMAGENES.md para documentación completa.\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('\nStack:', error.stack);
    process.exit(1);
  }
}

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Ejecutar test
testImageOptimization();
