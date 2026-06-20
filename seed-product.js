const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Parsear el archivo SQL de inserciones de Product
function parseSqlInserts(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const productos = [];
  
  // Regex para extraer los valores de cada INSERT
  // Formato: ('codigo', 'producto', 'marca', 'medida', 'almacen', 'garantia', 'despiece', 'taller', 'despieceGaraje', 'temporal', 'existenciaTotal', 'costoTotal')
  const regex = /\('(\d+)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([\d.,]+)'\)/g;
  
  let match;
  while ((match = regex.exec(content)) !== null) {
    const [, codigo, producto, marca, medida, almacen, garantia, despiece, taller, despieceGaraje, temporal, existenciaTotal, costoTotal] = match;
    
    productos.push({
      codigo: parseInt(codigo),
      producto: producto || null,
      marca: marca || null,
      medida: medida || null,
      almacen: almacen || null,
      garantia: garantia || null,
      despiece: despiece || null,
      taller: taller || null,
      despieceGaraje: despieceGaraje || null,
      temporal: temporal || null,
      existenciaTotal: existenciaTotal || null,
      costoTotal: parseFloat(costoTotal.replace(',', '')) || null,
    });
  }
  
  return productos;
}

async function main() {
  console.log('Iniciando seed de productos...');
  
  const filePath = path.join(__dirname, 'Inserciones_Product.txt');
  
  try {
    // Parsear el archivo SQL
    const productos = parseSqlInserts(filePath);
    console.log(`Se encontraron ${productos.length} registros para insertar`);
    
    // Limpiar tabla existente
    // Primero eliminar precios unitarios (FK)
    await prisma.precioUnitario.deleteMany({});
    console.log('Tabla Precio_Unitario limpiada');
    
    // Luego eliminar productos
    await prisma.product.deleteMany({});
    console.log('Tabla Product limpiada');
    
    // Insertar en lotes de 100 para mejor rendimiento
    const batchSize = 100;
    let inserted = 0;
    
    for (let i = 0; i < productos.length; i += batchSize) {
      const batch = productos.slice(i, i + batchSize);
      
      await prisma.product.createMany({
        data: batch,
        skipDuplicates: true,
      });
      
      inserted += batch.length;
      console.log(`Progreso: ${inserted}/${productos.length} registros insertados`);
    }
    
    console.log(`\n✅ Seed completado: ${inserted} productos insertados`);
    
    // Mostrar estadísticas por marca
    const marcas = {};
    productos.forEach(p => {
      const marca = p.marca || 'SIN MARCA';
      marcas[marca] = (marcas[marca] || 0) + 1;
    });
    
    console.log('\nDistribución por marca (top 10):');
    Object.entries(marcas)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([marca, count]) => {
        console.log(`   - ${marca}: ${count} productos`);
      });
    
  } catch (error) {
    console.error('Error al insertar productos:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
