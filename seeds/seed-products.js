const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Productos en el nuevo formato de tabla
const productos = [
  // Laptops
  {
    codigo: 1001,
    producto: 'Laptop Dell Inspiron 15',
    marca: 'Dell',
    medida: '15.6 pulgadas',
    almacen: 'Principal',
    garantia: '1 año',
    despiece: null,
    taller: null,
    despieceGaraje: null,
    temporal: null,
    existenciaTotal: '25',
    costoTotal: 599.99,
  },
  {
    codigo: 1002,
    producto: 'Laptop HP Pavilion 14',
    marca: 'HP',
    medida: '14 pulgadas',
    almacen: 'Principal',
    garantia: '1 año',
    despiece: null,
    taller: null,
    despieceGaraje: null,
    temporal: null,
    existenciaTotal: '18',
    costoTotal: 699.00,
  },
  {
    codigo: 1003,
    producto: 'Laptop Lenovo ThinkPad E14',
    marca: 'Lenovo',
    medida: '14 pulgadas',
    almacen: 'Principal',
    garantia: '1 año',
    despiece: null,
    taller: null,
    despieceGaraje: null,
    temporal: null,
    existenciaTotal: '15',
    costoTotal: 899.99,
  },
  {
    codigo: 1004,
    producto: 'Laptop Asus VivoBook 15',
    marca: 'Asus',
    medida: '15.6 pulgadas',
    almacen: 'Principal',
    garantia: '1 año',
    despiece: null,
    taller: null,
    despieceGaraje: null,
    temporal: null,
    existenciaTotal: '30',
    costoTotal: 449.99,
  },
  // Componentes - Procesadores
  {
    codigo: 2001,
    producto: 'Procesador Intel Core i5-12400F',
    marca: 'Intel',
    medida: 'Socket LGA1700',
    almacen: 'Principal',
    garantia: '3 años',
    despiece: null,
    taller: null,
    despieceGaraje: null,
    temporal: null,
    existenciaTotal: '40',
    costoTotal: 189.99,
  },
  {
    codigo: 2002,
    producto: 'Procesador AMD Ryzen 5 5600X',
    marca: 'AMD',
    medida: 'Socket AM4',
    almacen: 'Principal',
    garantia: '3 años',
    despiece: null,
    taller: null,
    despieceGaraje: null,
    temporal: null,
    existenciaTotal: '35',
    costoTotal: 199.00,
  },
  // Componentes - Memoria y Almacenamiento
  {
    codigo: 2003,
    producto: 'Memoria RAM Kingston Fury 16GB DDR4',
    marca: 'Kingston',
    medida: '16GB DDR4 3200MHz',
    almacen: 'Principal',
    garantia: 'Lifetime',
    despiece: null,
    taller: null,
    despieceGaraje: null,
    temporal: null,
    existenciaTotal: '50',
    costoTotal: 59.99,
  },
  {
    codigo: 2004,
    producto: 'SSD Samsung 970 EVO Plus 1TB',
    marca: 'Samsung',
    medida: 'M.2 NVMe',
    almacen: 'Principal',
    garantia: '5 años',
    despiece: null,
    taller: null,
    despieceGaraje: null,
    temporal: null,
    existenciaTotal: '45',
    costoTotal: 109.99,
  },
  {
    codigo: 2005,
    producto: 'Tarjeta Gráfica NVIDIA RTX 3060',
    marca: 'NVIDIA',
    medida: 'PCIe 4.0',
    almacen: 'Principal',
    garantia: '2 años',
    despiece: null,
    taller: null,
    despieceGaraje: null,
    temporal: null,
    existenciaTotal: '22',
    costoTotal: 329.99,
  },
  // Periféricos
  {
    codigo: 3001,
    producto: 'Mouse Logitech G502 Hero',
    marca: 'Logitech',
    medida: 'USB',
    almacen: 'Principal',
    garantia: '2 años',
    despiece: null,
    taller: null,
    despieceGaraje: null,
    temporal: null,
    existenciaTotal: '60',
    costoTotal: 49.99,
  },
  {
    codigo: 3002,
    producto: 'Teclado Mecánico Redragon K552',
    marca: 'Redragon',
    medida: 'Tenkeyless',
    almacen: 'Principal',
    garantia: '1 año',
    despiece: null,
    taller: null,
    despieceGaraje: null,
    temporal: null,
    existenciaTotal: '40',
    costoTotal: 39.99,
  },
  {
    codigo: 3003,
    producto: 'Teclado Mecánico Logitech G Pro X',
    marca: 'Logitech',
    medida: 'Tenkeyless',
    almacen: 'Principal',
    garantia: '2 años',
    despiece: null,
    taller: null,
    despieceGaraje: null,
    temporal: null,
    existenciaTotal: '28',
    costoTotal: 129.99,
  },
  {
    codigo: 3004,
    producto: 'Mouse Razer DeathAdder V3',
    marca: 'Razer',
    medida: 'USB',
    almacen: 'Principal',
    garantia: '2 años',
    despiece: null,
    taller: null,
    despieceGaraje: null,
    temporal: null,
    existenciaTotal: '45',
    costoTotal: 69.99,
  },
  // Monitores
  {
    codigo: 4001,
    producto: 'Monitor Samsung Odyssey G5 27"',
    marca: 'Samsung',
    medida: '27 pulgadas QHD',
    almacen: 'Principal',
    garantia: '1 año',
    despiece: null,
    taller: null,
    despieceGaraje: null,
    temporal: null,
    existenciaTotal: '20',
    costoTotal: 299.99,
  },
  {
    codigo: 4002,
    producto: 'Monitor LG UltraGear 24"',
    marca: 'LG',
    medida: '24 pulgadas FHD',
    almacen: 'Principal',
    garantia: '1 año',
    despiece: null,
    taller: null,
    despieceGaraje: null,
    temporal: null,
    existenciaTotal: '25',
    costoTotal: 179.99,
  },
  {
    codigo: 4003,
    producto: 'Monitor Dell UltraSharp 27"',
    marca: 'Dell',
    medida: '27 pulgadas 4K',
    almacen: 'Principal',
    garantia: '3 años',
    despiece: null,
    taller: null,
    despieceGaraje: null,
    temporal: null,
    existenciaTotal: '12',
    costoTotal: 449.99,
  },
  // Redes
  {
    codigo: 5001,
    producto: 'Router TP-Link Archer AX50',
    marca: 'TP-Link',
    medida: 'WiFi 6',
    almacen: 'Principal',
    garantia: '2 años',
    despiece: null,
    taller: null,
    despieceGaraje: null,
    temporal: null,
    existenciaTotal: '30',
    costoTotal: 129.99,
  },
  {
    codigo: 5002,
    producto: 'Switch Cisco SG350-10',
    marca: 'Cisco',
    medida: '10 puertos',
    almacen: 'Principal',
    garantia: 'Lifetime',
    despiece: null,
    taller: null,
    despieceGaraje: null,
    temporal: null,
    existenciaTotal: '18',
    costoTotal: 249.99,
  },
  {
    codigo: 5003,
    producto: 'Access Point Ubiquiti UniFi 6 Lite',
    marca: 'Ubiquiti',
    medida: 'WiFi 6 Dual Band',
    almacen: 'Principal',
    garantia: '1 año',
    despiece: null,
    taller: null,
    despieceGaraje: null,
    temporal: null,
    existenciaTotal: '25',
    costoTotal: 99.00,
  },
  // Audio
  {
    codigo: 6001,
    producto: 'Audífonos Sony WH-1000XM4',
    marca: 'Sony',
    medida: 'Over-ear',
    almacen: 'Principal',
    garantia: '1 año',
    despiece: null,
    taller: null,
    despieceGaraje: null,
    temporal: null,
    existenciaTotal: '20',
    costoTotal: 279.99,
  },
  {
    codigo: 6002,
    producto: 'Bocina JBL Flip 6',
    marca: 'JBL',
    medida: 'Portátil',
    almacen: 'Principal',
    garantia: '1 año',
    despiece: null,
    taller: null,
    despieceGaraje: null,
    temporal: null,
    existenciaTotal: '35',
    costoTotal: 129.99,
  },
  {
    codigo: 6003,
    producto: 'Micrófono Audio-Technica AT2020',
    marca: 'Audio-Technica',
    medida: 'XLR Condensador',
    almacen: 'Principal',
    garantia: '1 año',
    despiece: null,
    taller: null,
    despieceGaraje: null,
    temporal: null,
    existenciaTotal: '28',
    costoTotal: 99.00,
  },
  // Almacenamiento Externo
  {
    codigo: 7001,
    producto: 'Disco Duro Externo WD 2TB',
    marca: 'Western Digital',
    medida: '2TB USB 3.0',
    almacen: 'Principal',
    garantia: '2 años',
    despiece: null,
    taller: null,
    despieceGaraje: null,
    temporal: null,
    existenciaTotal: '55',
    costoTotal: 79.99,
  },
  {
    codigo: 7002,
    producto: 'SSD Externo Samsung T7 1TB',
    marca: 'Samsung',
    medida: '1TB USB-C',
    almacen: 'Principal',
    garantia: '3 años',
    despiece: null,
    taller: null,
    despieceGaraje: null,
    temporal: null,
    existenciaTotal: '30',
    costoTotal: 109.99,
  },
];

async function main() {
  console.log('Iniciando seed de productos...');
  
  try {
    // Limpiar productos existentes
    await prisma.product.deleteMany({});
    console.log('Productos existentes eliminados');

    // Insertar productos
    for (const producto of productos) {
      await prisma.product.create({
        data: producto,
      });
    }

    console.log(`${productos.length} productos insertados correctamente`);
    console.log('Distribución por marca:');
    
    const marcas = {};
    productos.forEach(p => {
      marcas[p.marca] = (marcas[p.marca] || 0) + 1;
    });
    
    Object.entries(marcas).forEach(([marca, count]) => {
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
