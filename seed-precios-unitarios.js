const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Parsear el archivo SQL de inserciones
function parseSqlInserts(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const precios = [];
  
  // Regex para extraer los valores de cada INSERT
  // Formato: ('codigo', 'producto', 'medida', 'precioC', 'precioB', 'precioA')
  const regex = /\('(\d+)',\s*'([^']*)',\s*'([^']*)',\s*'([\d.,]+)',\s*'([\d.,]+)',\s*'([\d.,]+)'\)/g;
  
  let match;
  while ((match = regex.exec(content)) !== null) {
    const [, codigo, producto, medida, precioC, precioB, precioA] = match;
    
    precios.push({
      codigo: parseInt(codigo),
      producto: producto || null,
      medida: medida || null,
      precioC: parseFloat(precioC.replace(',', '')) || null,
      precioB: parseFloat(precioB.replace(',', '')) || null,
      precioA: parseFloat(precioA.replace(',', '')) || null,
    });
  }
  
  return precios;
}

async function main() {
  console.log('Iniciando seed de precios unitarios...');
  
  const filePath = path.join(__dirname, 'Inserciones_Precio_unitario.txt');
  
  try {
    // Parsear el archivo SQL
    const precios = parseSqlInserts(filePath);
    console.log(`Se encontraron ${precios.length} registros para insertar`);
    
    // Limpiar tabla existente
    await prisma.precioUnitario.deleteMany({});
    console.log('Tabla Precio_Unitario limpiada');
    
    // Obtener los códigos de productos existentes para validar FK
    const productosExistentes = await prisma.product.findMany({
      select: { codigo: true }
    });
    const codigosValidos = new Set(productosExistentes.map(p => p.codigo));
    console.log(`Productos existentes en DB: ${codigosValidos.size}`);
    
    // Filtrar solo los precios que tienen producto existente
    const preciosValidos = precios.filter(p => codigosValidos.has(p.codigo));
    const preciosInvalidos = precios.filter(p => !codigosValidos.has(p.codigo));
    
    console.log(`Precios con producto válido: ${preciosValidos.length}`);
    console.log(`Precios sin producto (se omitirán): ${preciosInvalidos.length}`);
    
    // Insertar en lotes de 100 para mejor rendimiento
    const batchSize = 100;
    let inserted = 0;
    
    for (let i = 0; i < preciosValidos.length; i += batchSize) {
      const batch = preciosValidos.slice(i, i + batchSize);
      
      await prisma.precioUnitario.createMany({
        data: batch,
        skipDuplicates: true,
      });
      
      inserted += batch.length;
      console.log(`Progreso: ${inserted}/${preciosValidos.length} registros insertados`);
    }
    
    console.log(`\n✅ Seed completado: ${inserted} precios unitarios insertados`);
    
    // Mostrar algunos ejemplos de precios omitidos (si hay)
    if (preciosInvalidos.length > 0) {
      console.log('\n⚠️  Primeros 10 códigos sin producto en la tabla Product:');
      preciosInvalidos.slice(0, 10).forEach(p => {
        console.log(`   - Código: ${p.codigo}, Producto: ${p.producto}`);
      });
    }
    
  } catch (error) {
    console.error('Error al insertar precios:', error);
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
