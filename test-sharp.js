/**
 * Script para verificar que sharp está instalado y funciona correctamente
 * Ejecutar con: node test-sharp.js
 */

console.log('=== Verificación de Sharp ===\n');

try {
  // Intentar importar sharp
  console.log('1. Importando sharp...');
  const sharp = require('sharp');
  console.log('   ✓ Sharp importado correctamente\n');

  // Verificar versión
  console.log('2. Verificando versión...');
  console.log(`   ✓ Versión de sharp: ${sharp.versions.sharp}`);
  console.log(`   ✓ Versión de libvips: ${sharp.versions.vips}\n`);

  // Verificar formatos soportados
  console.log('3. Verificando formatos soportados...');
  const formats = sharp.format;
  console.log('   ✓ Formatos de entrada:', Object.keys(formats.input || formats).join(', '));
  console.log('   ✓ Formatos de salida:', Object.keys(formats.output || formats).join(', '));
  console.log();

  // Test básico de funcionalidad
  console.log('4. Realizando test básico...');
  sharp({
    create: {
      width: 100,
      height: 100,
      channels: 3,
      background: { r: 255, g: 0, b: 0 }
    }
  })
    .png()
    .toBuffer()
    .then(() => {
      console.log('   ✓ Test de creación de imagen exitoso\n');
      console.log('=== Sharp está funcionando correctamente ✓ ===');
    })
    .catch(error => {
      console.error('   ✗ Error en test de funcionalidad:', error.message);
      console.log('\n=== Sharp tiene problemas ✗ ===');
      process.exit(1);
    });

} catch (error) {
  console.error('✗ Error al importar sharp:', error.message);
  console.log('\nPosibles soluciones:');
  console.log('1. Reinstalar sharp: npm install sharp --force');
  console.log('2. Limpiar cache: npm cache clean --force');
  console.log('3. Eliminar node_modules y reinstalar: rm -rf node_modules && npm install');
  console.log('\n=== Sharp NO está instalado correctamente ✗ ===');
  process.exit(1);
}
