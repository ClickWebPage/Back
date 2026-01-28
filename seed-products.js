const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const productos = [
  // Laptops
  {
    nombre_producto: 'Laptop Dell Inspiron 15',
    descripcion: 'Laptop Dell Inspiron 15 con procesador Intel Core i5, 8GB RAM, 256GB SSD, pantalla Full HD de 15.6 pulgadas',
    precio: 599.99,
    stock: 25,
    imagen_url: '/Productos/laptop-dell-inspiron.jpg',
    marca: 'Dell',
    color: 'Plata',
    categoria: 'Laptops',
    subcategoria: 'Laptops Personales',
    modelo: 'Inspiron 15 3520',
    sku: 'DELL-LAP-001',
    especificaciones: 'Intel Core i5-1235U, 8GB DDR4, 256GB SSD, Windows 11 Home, Pantalla 15.6 FHD',
    garantia: '1 año de garantia del fabricante',
    activo: true,
    destacado: true
  },
  {
    nombre_producto: 'Laptop HP Pavilion 14',
    descripcion: 'Laptop HP Pavilion 14 ultradelgada, AMD Ryzen 5, 16GB RAM, 512GB SSD, ideal para trabajo y estudio',
    precio: 699.00,
    stock: 18,
    imagen_url: '/Productos/laptop-hp-pavilion.jpg',
    marca: 'HP',
    color: 'Azul Profundo',
    categoria: 'Laptops',
    subcategoria: 'Laptops Personales',
    modelo: 'Pavilion 14-ec1077la',
    sku: 'HP-LAP-001',
    especificaciones: 'AMD Ryzen 5 5500U, 16GB DDR4, 512GB NVMe SSD, Windows 11, Pantalla 14 FHD IPS',
    garantia: '1 año de garantia del fabricante',
    activo: true,
    destacado: true
  },
  {
    nombre_producto: 'Laptop Lenovo ThinkPad E14',
    descripcion: 'Laptop empresarial Lenovo ThinkPad E14, Intel Core i7, 16GB RAM, 512GB SSD, diseño robusto y seguro',
    precio: 899.99,
    stock: 15,
    imagen_url: '/Productos/laptop-lenovo-thinkpad.jpg',
    marca: 'Lenovo',
    color: 'Negro',
    categoria: 'Laptops',
    subcategoria: 'Laptops Empresariales',
    modelo: 'ThinkPad E14 Gen 4',
    sku: 'LEN-LAP-001',
    especificaciones: 'Intel Core i7-1255U, 16GB DDR4, 512GB SSD, Windows 11 Pro, Pantalla 14 FHD',
    garantia: '1 año de garantia del fabricante',
    activo: true,
    destacado: false
  },
  {
    nombre_producto: 'Laptop Asus VivoBook 15',
    descripcion: 'Laptop Asus VivoBook 15 con diseño moderno, Intel Core i3, 8GB RAM, 256GB SSD, excelente para estudiantes',
    precio: 449.99,
    stock: 30,
    imagen_url: '/Productos/laptop-asus-vivobook.jpg',
    marca: 'Asus',
    color: 'Gris Transparente',
    categoria: 'Laptops',
    subcategoria: 'Laptops Personales',
    modelo: 'VivoBook 15 X515EA',
    sku: 'ASUS-LAP-001',
    especificaciones: 'Intel Core i3-1115G4, 8GB DDR4, 256GB SSD, Windows 11 Home, Pantalla 15.6 FHD',
    garantia: '1 año de garantia del fabricante',
    activo: true,
    destacado: false
  },

  // Componentes
  {
    nombre_producto: 'Procesador Intel Core i5-12400F',
    descripcion: 'Procesador Intel Core i5 de 12va generacion, 6 nucleos, 12 hilos, ideal para gaming y productividad',
    precio: 189.99,
    stock: 40,
    imagen_url: '/Productos/procesador-intel-i5.jpg',
    marca: 'Intel',
    color: null,
    categoria: 'Componentes',
    subcategoria: 'Procesadores',
    modelo: 'Core i5-12400F',
    sku: 'INTEL-CPU-001',
    especificaciones: '6 nucleos, 12 hilos, 2.5GHz base / 4.4GHz turbo, Socket LGA1700, 18MB cache',
    garantia: '3 años de garantia del fabricante',
    activo: true,
    destacado: true
  },
  {
    nombre_producto: 'Procesador AMD Ryzen 5 5600X',
    descripcion: 'Procesador AMD Ryzen 5 5600X, 6 nucleos, 12 hilos, arquitectura Zen 3, excelente rendimiento gaming',
    precio: 199.00,
    stock: 35,
    imagen_url: '/Productos/procesador-amd-ryzen5.jpg',
    marca: 'AMD',
    color: null,
    categoria: 'Componentes',
    subcategoria: 'Procesadores',
    modelo: 'Ryzen 5 5600X',
    sku: 'AMD-CPU-001',
    especificaciones: '6 nucleos, 12 hilos, 3.7GHz base / 4.6GHz boost, Socket AM4, 35MB cache',
    garantia: '3 años de garantia del fabricante',
    activo: true,
    destacado: true
  },
  {
    nombre_producto: 'Tarjeta Grafica NVIDIA GeForce RTX 3060',
    descripcion: 'Tarjeta grafica NVIDIA GeForce RTX 3060 12GB, Ray Tracing, DLSS, perfecta para gaming 1080p/1440p',
    precio: 329.99,
    stock: 22,
    imagen_url: '/Productos/gpu-nvidia-rtx3060.jpg',
    marca: 'NVIDIA',
    color: null,
    categoria: 'Componentes',
    subcategoria: 'Tarjetas Graficas',
    modelo: 'GeForce RTX 3060',
    sku: 'NVIDIA-GPU-001',
    especificaciones: '12GB GDDR6, 3584 CUDA Cores, Ray Tracing, DLSS 2.0, PCIe 4.0',
    garantia: '2 años de garantia del fabricante',
    activo: true,
    destacado: true
  },
  {
    nombre_producto: 'Memoria RAM Corsair Vengeance 16GB DDR4',
    descripcion: 'Kit de memoria RAM Corsair Vengeance 16GB (2x8GB) DDR4 3200MHz, ideal para gaming y multitarea',
    precio: 59.99,
    stock: 60,
    imagen_url: '/Productos/ram-corsair-vengeance.jpg',
    marca: 'Corsair',
    color: 'Negro',
    categoria: 'Componentes',
    subcategoria: 'Memoria RAM',
    modelo: 'Vengeance LPX',
    sku: 'CORS-RAM-001',
    especificaciones: '16GB (2x8GB), DDR4, 3200MHz, CL16, 1.35V, Disipador de calor',
    garantia: 'Garantia de por vida limitada',
    activo: true,
    destacado: false
  },

  // Perifericos
  {
    nombre_producto: 'Teclado Mecanico Logitech G Pro X',
    descripcion: 'Teclado mecanico gaming Logitech G Pro X con switches intercambiables, RGB, cable desmontable',
    precio: 129.99,
    stock: 28,
    imagen_url: '/Productos/teclado-logitech-gpro.jpg',
    marca: 'Logitech',
    color: 'Negro',
    categoria: 'Perifericos',
    subcategoria: 'Teclados',
    modelo: 'G Pro X',
    sku: 'LOGI-TEC-001',
    especificaciones: 'Switches GX Blue intercambiables, RGB LIGHTSYNC, Cable micro-USB desmontable, Tenkeyless',
    garantia: '2 años de garantia del fabricante',
    activo: true,
    destacado: true
  },
  {
    nombre_producto: 'Mouse Gaming Razer DeathAdder V3',
    descripcion: 'Mouse gaming Razer DeathAdder V3, sensor optico 30K DPI, switches opticas Gen-3, diseño ergonomico',
    precio: 69.99,
    stock: 45,
    imagen_url: '/Productos/mouse-razer-deathadder.jpg',
    marca: 'Razer',
    color: 'Negro',
    categoria: 'Perifericos',
    subcategoria: 'Mouse',
    modelo: 'DeathAdder V3',
    sku: 'RAZER-MOU-001',
    especificaciones: 'Sensor Focus Pro 30K, 8 botones programables, RGB Chroma, Hasta 30,000 DPI',
    garantia: '2 años de garantia del fabricante',
    activo: true,
    destacado: true
  },
  {
    nombre_producto: 'Headset HyperX Cloud II',
    descripcion: 'Audifonos gaming HyperX Cloud II con sonido surround 7.1, microfono desmontable, comodidad superior',
    precio: 99.99,
    stock: 35,
    imagen_url: '/Productos/headset-hyperx-cloud2.jpg',
    marca: 'HyperX',
    color: 'Rojo/Negro',
    categoria: 'Perifericos',
    subcategoria: 'Headsets',
    modelo: 'Cloud II',
    sku: 'HYPERX-HEAD-001',
    especificaciones: 'Sonido surround 7.1, Microfono con cancelacion de ruido, Drivers 53mm, Compatible multiplataforma',
    garantia: '2 años de garantia del fabricante',
    activo: true,
    destacado: false
  },
  {
    nombre_producto: 'Webcam Logitech C920 HD Pro',
    descripcion: 'Webcam Logitech C920 con video Full HD 1080p, correccion de luz automatica, microfono estereo',
    precio: 79.99,
    stock: 50,
    imagen_url: '/Productos/webcam-logitech-c920.jpg',
    marca: 'Logitech',
    color: 'Negro',
    categoria: 'Perifericos',
    subcategoria: 'Webcams',
    modelo: 'C920 HD Pro',
    sku: 'LOGI-WEB-001',
    especificaciones: 'Video 1080p 30fps, Correccion de luz HD, Microfonos estereo, Enfoque automatico',
    garantia: '2 años de garantia del fabricante',
    activo: true,
    destacado: false
  },

  // Almacenamiento
  {
    nombre_producto: 'SSD Kingston NV2 500GB NVMe',
    descripcion: 'Unidad SSD Kingston NV2 500GB, interfaz NVMe PCIe 4.0, velocidades de lectura hasta 3500 MB/s',
    precio: 44.99,
    stock: 70,
    imagen_url: '/Productos/ssd-kingston-nv2.jpg',
    marca: 'Kingston',
    color: null,
    categoria: 'Almacenamiento',
    subcategoria: 'SSD NVMe',
    modelo: 'NV2 500GB',
    sku: 'KING-SSD-001',
    especificaciones: '500GB, NVMe PCIe 4.0, Lectura 3500MB/s, Escritura 2100MB/s, Factor M.2 2280',
    garantia: '3 años de garantia del fabricante',
    activo: true,
    destacado: true
  },
  {
    nombre_producto: 'SSD Samsung 980 PRO 1TB',
    descripcion: 'SSD Samsung 980 PRO 1TB, NVMe PCIe 4.0, velocidades extremas hasta 7000 MB/s, ideal para profesionales',
    precio: 129.99,
    stock: 45,
    imagen_url: '/Productos/ssd-samsung-980pro.jpg',
    marca: 'Samsung',
    color: null,
    categoria: 'Almacenamiento',
    subcategoria: 'SSD NVMe',
    modelo: '980 PRO 1TB',
    sku: 'SAMS-SSD-001',
    especificaciones: '1TB, NVMe PCIe 4.0, Lectura 7000MB/s, Escritura 5000MB/s, Factor M.2 2280',
    garantia: '5 años de garantia del fabricante',
    activo: true,
    destacado: true
  },
  {
    nombre_producto: 'Disco Duro WD Blue 2TB',
    descripcion: 'Disco duro interno WD Blue 2TB, 7200 RPM, cache 256MB, ideal para almacenamiento masivo',
    precio: 54.99,
    stock: 55,
    imagen_url: '/Productos/hdd-wd-blue.jpg',
    marca: 'WD',
    color: null,
    categoria: 'Almacenamiento',
    subcategoria: 'Discos Duros',
    modelo: 'Blue 2TB',
    sku: 'WD-HDD-001',
    especificaciones: '2TB, 7200 RPM, SATA 6Gb/s, Cache 256MB, 3.5 pulgadas',
    garantia: '2 años de garantia del fabricante',
    activo: true,
    destacado: false
  },
  {
    nombre_producto: 'Disco Externo Seagate Expansion 4TB',
    descripcion: 'Disco duro externo Seagate Expansion 4TB, USB 3.0, plug and play, ideal para respaldos',
    precio: 89.99,
    stock: 40,
    imagen_url: '/Productos/hdd-externo-seagate.jpg',
    marca: 'Seagate',
    color: 'Negro',
    categoria: 'Almacenamiento',
    subcategoria: 'Discos Externos',
    modelo: 'Expansion 4TB',
    sku: 'SEAG-EXT-001',
    especificaciones: '4TB, USB 3.0, Plug and Play, Compatible Windows/Mac, Portatil',
    garantia: '1 año de garantia del fabricante',
    activo: true,
    destacado: false
  },

  // Redes
  {
    nombre_producto: 'Router TP-Link Archer AX55',
    descripcion: 'Router WiFi 6 TP-Link Archer AX55, velocidades hasta 3000 Mbps, cobertura amplia, ideal para hogares',
    precio: 89.99,
    stock: 32,
    imagen_url: '/Productos/router-tplink-ax55.jpg',
    marca: 'TP-Link',
    color: 'Negro',
    categoria: 'Redes',
    subcategoria: 'Routers',
    modelo: 'Archer AX55',
    sku: 'TPL-ROUT-001',
    especificaciones: 'WiFi 6 (802.11ax), Dual Band 3000Mbps, 4 antenas, 4 puertos Gigabit, Control parental',
    garantia: '2 años de garantia del fabricante',
    activo: true,
    destacado: true
  },
  {
    nombre_producto: 'Switch Cisco SG110-24',
    descripcion: 'Switch Gigabit Cisco SG110-24 de 24 puertos, no administrable, plug and play para redes empresariales',
    precio: 149.99,
    stock: 18,
    imagen_url: '/Productos/switch-cisco-sg110.jpg',
    marca: 'Cisco',
    color: 'Gris',
    categoria: 'Redes',
    subcategoria: 'Switches',
    modelo: 'SG110-24',
    sku: 'CISCO-SW-001',
    especificaciones: '24 puertos Gigabit Ethernet, No administrable, Plug and Play, Montaje en rack',
    garantia: '3 años de garantia del fabricante',
    activo: true,
    destacado: false
  },
  {
    nombre_producto: 'Access Point Ubiquiti UniFi 6 Lite',
    descripcion: 'Access Point WiFi 6 Ubiquiti UniFi 6 Lite, dual band, gestion centralizada, ideal para empresas',
    precio: 99.00,
    stock: 25,
    imagen_url: '/Productos/ap-ubiquiti-u6lite.jpg',
    marca: 'Ubiquiti',
    color: 'Blanco',
    categoria: 'Redes',
    subcategoria: 'Access Points',
    modelo: 'UniFi 6 Lite',
    sku: 'UBI-AP-001',
    especificaciones: 'WiFi 6, Dual Band, 1.5 Gbps combinado, PoE, Gestion UniFi Controller',
    garantia: '1 año de garantia del fabricante',
    activo: true,
    destacado: true
  },
  {
    nombre_producto: 'Adaptador USB WiFi TP-Link Archer T3U',
    descripcion: 'Adaptador USB WiFi TP-Link Archer T3U, doble banda AC1300, USB 3.0, antena de alto ganancia',
    precio: 19.99,
    stock: 80,
    imagen_url: '/Productos/usb-wifi-tplink-t3u.jpg',
    marca: 'TP-Link',
    color: 'Negro',
    categoria: 'Redes',
    subcategoria: 'Adaptadores WiFi',
    modelo: 'Archer T3U',
    sku: 'TPL-WIFI-001',
    especificaciones: 'AC1300 Dual Band, USB 3.0, Antena externa, Soporte Windows/Mac/Linux',
    garantia: '2 años de garantia del fabricante',
    activo: true,
    destacado: false
  },

  // Audio
  {
    nombre_producto: 'Bocinas Sony SRS-XB43',
    descripcion: 'Bocina Bluetooth Sony SRS-XB43, Extra Bass, resistente al agua IP67, 24 horas de bateria',
    precio: 179.99,
    stock: 20,
    imagen_url: '/Productos/bocina-sony-xb43.jpg',
    marca: 'Sony',
    color: 'Negro',
    categoria: 'Audio',
    subcategoria: 'Bocinas Bluetooth',
    modelo: 'SRS-XB43',
    sku: 'SONY-BOC-001',
    especificaciones: 'Bluetooth 5.0, Extra Bass, IP67 resistente al agua, 24h bateria, Luces LED',
    garantia: '1 año de garantia del fabricante',
    activo: true,
    destacado: true
  },
  {
    nombre_producto: 'Bocina JBL Flip 6',
    descripcion: 'Bocina portatil JBL Flip 6, sonido potente, resistente al agua y polvo IP67, hasta 12 horas',
    precio: 129.99,
    stock: 35,
    imagen_url: '/Productos/bocina-jbl-flip6.jpg',
    marca: 'JBL',
    color: 'Azul',
    categoria: 'Audio',
    subcategoria: 'Bocinas Bluetooth',
    modelo: 'Flip 6',
    sku: 'JBL-BOC-001',
    especificaciones: 'Bluetooth 5.1, IP67, 12h bateria, PartyBoost, Diseño portatil',
    garantia: '1 año de garantia del fabricante',
    activo: true,
    destacado: false
  },
  {
    nombre_producto: 'Audifonos Bose QuietComfort 45',
    descripcion: 'Audifonos Bose QuietComfort 45 con cancelacion de ruido lider, Bluetooth, comodidad premium',
    precio: 329.00,
    stock: 15,
    imagen_url: '/Productos/audifonos-bose-qc45.jpg',
    marca: 'Bose',
    color: 'Negro',
    categoria: 'Audio',
    subcategoria: 'Audifonos',
    modelo: 'QuietComfort 45',
    sku: 'BOSE-AUD-001',
    especificaciones: 'Cancelacion de ruido activa, Bluetooth 5.1, 24h bateria, Microfono integrado',
    garantia: '1 año de garantia del fabricante',
    activo: true,
    destacado: true
  },
  {
    nombre_producto: 'Microfono Audio-Technica AT2020',
    descripcion: 'Microfono de condensador Audio-Technica AT2020, calidad studio, ideal para streaming y grabacion',
    precio: 99.00,
    stock: 28,
    imagen_url: '/Productos/microfono-at2020.jpg',
    marca: 'Audio-Technica',
    color: 'Negro',
    categoria: 'Audio',
    subcategoria: 'Microfonos',
    modelo: 'AT2020',
    sku: 'AUDTECH-MIC-001',
    especificaciones: 'Condensador cardioide, XLR, Respuesta 20Hz-20kHz, Incluye soporte',
    garantia: '1 año de garantia del fabricante',
    activo: true,
    destacado: false
  },
];

async function main() {
  console.log('Iniciando seed de productos...');
  
  try {
    // Limpiar productos existentes (opcional, comentar si no deseas borrar)
    await prisma.product.deleteMany({});
    console.log('Productos existentes eliminados');

    // Insertar productos
    for (const producto of productos) {
      await prisma.product.create({
        data: producto,
      });
    }

    console.log(`${productos.length} productos insertados correctamente`);
    console.log('Distribucion por categoria:');
    
    const categorias = {};
    productos.forEach(p => {
      categorias[p.categoria] = (categorias[p.categoria] || 0) + 1;
    });
    
    Object.entries(categorias).forEach(([cat, count]) => {
      console.log(`   - ${cat}: ${count} productos`);
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
