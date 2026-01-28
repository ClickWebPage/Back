const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Actualizar las URLs de las imágenes de los productos
// Puedes usar este script para cambiar las URLs a imágenes reales o placeholders

const imagenesActualizadas = {
  // Laptops
  'DELL-LAP-001': 'https://via.placeholder.com/300x200?text=Dell+Inspiron+15',
  'HP-LAP-001': 'https://via.placeholder.com/300x200?text=HP+Pavilion+14',
  'LEN-LAP-001': 'https://via.placeholder.com/300x200?text=Lenovo+ThinkPad',
  'ASUS-LAP-001': 'https://via.placeholder.com/300x200?text=Asus+VivoBook',
  
  // Componentes
  'INTEL-CPU-001': 'https://via.placeholder.com/300x200?text=Intel+Core+i5',
  'AMD-CPU-001': 'https://via.placeholder.com/300x200?text=AMD+Ryzen+5',
  'NVIDIA-GPU-001': 'https://via.placeholder.com/300x200?text=RTX+3060',
  'CORS-RAM-001': 'https://via.placeholder.com/300x200?text=Corsair+RAM',
  
  // Periféricos
  'LOGI-TEC-001': 'https://via.placeholder.com/300x200?text=Logitech+G+Pro',
  'RAZER-MOU-001': 'https://via.placeholder.com/300x200?text=Razer+DeathAdder',
  'HYPERX-HEAD-001': 'https://via.placeholder.com/300x200?text=HyperX+Cloud+II',
  'LOGI-WEB-001': 'https://via.placeholder.com/300x200?text=Logitech+C920',
  
  // Almacenamiento
  'KING-SSD-001': 'https://via.placeholder.com/300x200?text=Kingston+NV2',
  'SAMS-SSD-001': 'https://via.placeholder.com/300x200?text=Samsung+980+PRO',
  'WD-HDD-001': 'https://via.placeholder.com/300x200?text=WD+Blue',
  'SEAG-EXT-001': 'https://via.placeholder.com/300x200?text=Seagate+Expansion',
  
  // Redes
  'TPL-ROUT-001': 'https://via.placeholder.com/300x200?text=TP-Link+AX55',
  'CISCO-SW-001': 'https://via.placeholder.com/300x200?text=Cisco+Switch',
  'UBI-AP-001': 'https://via.placeholder.com/300x200?text=Ubiquiti+U6',
  'TPL-WIFI-001': 'https://via.placeholder.com/300x200?text=TP-Link+WiFi',
  
  // Audio
  'SONY-BOC-001': 'https://via.placeholder.com/300x200?text=Sony+XB43',
  'JBL-BOC-001': 'https://via.placeholder.com/300x200?text=JBL+Flip+6',
  'BOSE-AUD-001': 'https://via.placeholder.com/300x200?text=Bose+QC45',
  'AUDTECH-MIC-001': 'https://via.placeholder.com/300x200?text=Audio-Technica+AT2020',
};

async function main() {
  console.log('🖼️  Actualizando URLs de imágenes de productos...');
  
  let actualizados = 0;
  let errores = 0;

  for (const [sku, imagen_url] of Object.entries(imagenesActualizadas)) {
    try {
      const result = await prisma.product.update({
        where: { sku },
        data: { imagen_url },
      });
      
      console.log(`✅ Actualizado: ${result.nombre_producto}`);
      actualizados++;
    } catch (error) {
      console.error(`❌ Error al actualizar producto con SKU ${sku}:`, error.message);
      errores++;
    }
  }

  console.log('\n📊 Resumen:');
  console.log(`   ✅ Productos actualizados: ${actualizados}`);
  console.log(`   ❌ Errores: ${errores}`);
  console.log('\n💡 Tip: Reemplaza las URLs en este script con URLs reales o rutas locales');
}

main()
  .catch((e) => {
    console.error('❌ Error general:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
