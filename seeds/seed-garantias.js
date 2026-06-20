// Script para poblar garantías iniciales por marca
// Ejecutar con: node seed-garantias.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const garantiasIniciales = [
  { marca: 'ASUS', meses: 12, mensaje: 'Garantía oficial ASUS de 12 meses' },
  { marca: 'MSI', meses: 24, mensaje: 'Garantía MSI de 2 años en componentes' },
  { marca: 'AMD', meses: 36, mensaje: 'Garantía AMD de 3 años' },
  { marca: 'Intel', meses: 36, mensaje: 'Garantía Intel de 3 años' },
  { marca: 'NVIDIA', meses: 12, mensaje: 'Garantía de 12 meses en tarjetas gráficas' },
  { marca: 'Corsair', meses: 24, mensaje: 'Garantía Corsair de 2 años' },
  { marca: 'Kingston', meses: 60, mensaje: 'Garantía Kingston de 5 años en memorias' },
  { marca: 'Logitech', meses: 24, mensaje: 'Garantía Logitech de 2 años' },
  { marca: 'Razer', meses: 24, mensaje: 'Garantía Razer de 2 años' },
  { marca: 'Samsung', meses: 12, mensaje: 'Garantía Samsung de 1 año' },
  { marca: 'Western Digital', meses: 24, mensaje: 'Garantía WD de 2 años' },
  { marca: 'Seagate', meses: 24, mensaje: 'Garantía Seagate de 2 años' },
  { marca: 'TP-Link', meses: 12, mensaje: 'Garantía TP-Link de 1 año' },
  { marca: 'HP', meses: 12, mensaje: 'Garantía HP de 1 año' },
  { marca: 'Dell', meses: 12, mensaje: 'Garantía Dell de 1 año' },
  { marca: 'Lenovo', meses: 12, mensaje: 'Garantía Lenovo de 1 año' },
  { marca: 'Acer', meses: 12, mensaje: 'Garantía Acer de 1 año' },
];

async function seedGarantias() {
  console.log('Iniciando seed de garantías por marca...');

  for (const garantia of garantiasIniciales) {
    try {
      const result = await prisma.garantiaMarca.upsert({
        where: { marca: garantia.marca },
        update: {
          meses: garantia.meses,
          mensaje: garantia.mensaje,
          activo: true,
        },
        create: {
          marca: garantia.marca,
          meses: garantia.meses,
          mensaje: garantia.mensaje,
          activo: true,
        },
      });
      console.log(`✓ Garantía para ${result.marca}: ${result.meses} meses`);
    } catch (error) {
      console.error(`✗ Error al crear garantía para ${garantia.marca}:`, error.message);
    }
  }

  console.log('\nSeed de garantías completado.');
}

seedGarantias()
  .catch((error) => {
    console.error('Error en el seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
