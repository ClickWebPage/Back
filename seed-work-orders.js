const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Función para generar un tracking ID único
function generateTrackingId(index) {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `WO-${randomNum + index}`;
}

// Datos de ejemplo para Work Orders
const workOrdersData = [
  // Órdenes EN_ESPERA (sin asignar)
  {
    trackingId: 'WO-1001',
    cliente_nombre: 'María González Pérez',
    cliente_telefono: '555-0101',
    cliente_email: 'maria.gonzalez@example.com',
    marca_equipo: 'HP',
    modelo_equipo: 'Pavilion 15',
    numero_serie: 'SN-HP-001-2024',
    descripcion_problema: 'La laptop no enciende, no muestra señales de vida. Al conectar el cargador no hay luz indicadora. El equipo tiene aproximadamente 2 años de uso.',
    estado: 'EN_ESPERA',
    costo_estimado: 50.00,
    tecnico_id: null,
    tecnico_nombre: null,
    notas_tecnicas: null,
    costo_final: null,
    fecha_entrega: null,
  },
  {
    trackingId: 'WO-1002',
    cliente_nombre: 'José Antonio Ramírez',
    cliente_telefono: '555-0102',
    cliente_email: 'jose.ramirez@example.com',
    marca_equipo: 'Dell',
    modelo_equipo: 'Inspiron 14 5000',
    numero_serie: 'SN-DELL-002-2024',
    descripcion_problema: 'La pantalla parpadea constantemente. El problema es intermitente, a veces funciona bien por horas y luego empieza a parpadear.',
    estado: 'EN_ESPERA',
    costo_estimado: 75.00,
    tecnico_id: null,
    tecnico_nombre: null,
    notas_tecnicas: null,
    costo_final: null,
    fecha_entrega: null,
  },
  {
    trackingId: 'WO-1003',
    cliente_nombre: 'Carmen López Torres',
    cliente_telefono: '555-0103',
    cliente_email: null,
    marca_equipo: 'Asus',
    modelo_equipo: 'VivoBook 15',
    numero_serie: 'SN-ASUS-003-2024',
    descripcion_problema: 'El teclado derrama líquido (café). Varias teclas no responden correctamente, especialmente las de la fila superior.',
    estado: 'EN_ESPERA',
    costo_estimado: 120.00,
    tecnico_id: null,
    tecnico_nombre: null,
    notas_tecnicas: null,
    costo_final: null,
    fecha_entrega: null,
  },
  
  // Órdenes EN_REVISION (asignadas a técnicos)
  {
    trackingId: 'WO-1004',
    cliente_nombre: 'Roberto Sánchez Díaz',
    cliente_telefono: '555-0104',
    cliente_email: 'roberto.sanchez@example.com',
    marca_equipo: 'Lenovo',
    modelo_equipo: 'ThinkPad E14',
    numero_serie: 'SN-LEN-004-2024',
    descripcion_problema: 'El equipo se sobrecalienta y se apaga solo después de 30 minutos de uso. El ventilador hace ruido extraño.',
    estado: 'EN_REVISION',
    costo_estimado: 60.00,
    tecnico_id: 1,
    tecnico_nombre: 'Carlos Técnico Rodríguez',
    notas_tecnicas: 'Revisión inicial: ventilador obstruido con polvo. Se requiere limpieza profunda y posible reemplazo de pasta térmica.',
    costo_final: null,
    fecha_entrega: null,
  },
  {
    trackingId: 'WO-1005',
    cliente_nombre: 'Ana María Fernández',
    cliente_telefono: '555-0105',
    cliente_email: 'ana.fernandez@example.com',
    marca_equipo: 'Acer',
    modelo_equipo: 'Aspire 5',
    numero_serie: 'SN-ACER-005-2024',
    descripcion_problema: 'No detecta el disco duro. Al encender muestra mensaje de error "No bootable device found".',
    estado: 'EN_REVISION',
    costo_estimado: 150.00,
    tecnico_id: 2,
    tecnico_nombre: 'Luis Martínez Silva',
    notas_tecnicas: 'Diagnóstico en proceso. Cable SATA desconectado, reconectado para verificar si es problema de conexión o disco dañado.',
    costo_final: null,
    fecha_entrega: null,
  },
  
  // Órdenes REPARADO (listas para entrega)
  {
    trackingId: 'WO-1006',
    cliente_nombre: 'Pedro Hernández Castro',
    cliente_telefono: '555-0106',
    cliente_email: 'pedro.hernandez@example.com',
    marca_equipo: 'HP',
    modelo_equipo: 'ProBook 450',
    numero_serie: 'SN-HP-006-2024',
    descripcion_problema: 'El puerto USB no funciona, no reconoce ningún dispositivo conectado.',
    estado: 'REPARADO',
    costo_estimado: 40.00,
    tecnico_id: 1,
    tecnico_nombre: 'Carlos Técnico Rodríguez',
    notas_tecnicas: 'Puerto USB dañado por cortocircuito. Se reemplazó el puerto USB completo. Probado con múltiples dispositivos, funciona correctamente.',
    costo_final: 45.00,
    fecha_entrega: null,
  },
  {
    trackingId: 'WO-1007',
    cliente_nombre: 'Laura Gómez Ruiz',
    cliente_telefono: '555-0107',
    cliente_email: 'laura.gomez@example.com',
    marca_equipo: 'Dell',
    modelo_equipo: 'Latitude 3410',
    numero_serie: 'SN-DELL-007-2024',
    descripcion_problema: 'La batería no carga, siempre muestra 0% aunque esté conectada al cargador.',
    estado: 'REPARADO',
    costo_estimado: 80.00,
    tecnico_id: 2,
    tecnico_nombre: 'Luis Martínez Silva',
    notas_tecnicas: 'Batería completamente agotada, no acepta carga. Se instaló batería nueva compatible. Sistema de carga verificado y funcional.',
    costo_final: 85.00,
    fecha_entrega: null,
  },
  
  // Órdenes ENTREGADO (completadas)
  {
    trackingId: 'WO-1008',
    cliente_nombre: 'Miguel Ángel Torres',
    cliente_telefono: '555-0108',
    cliente_email: 'miguel.torres@example.com',
    marca_equipo: 'Asus',
    modelo_equipo: 'TUF Gaming A15',
    numero_serie: 'SN-ASUS-008-2024',
    descripcion_problema: 'Muy lenta, tarda mucho en iniciar Windows. El sistema operativo se congela frecuentemente.',
    estado: 'ENTREGADO',
    costo_estimado: 100.00,
    tecnico_id: 1,
    tecnico_nombre: 'Carlos Técnico Rodríguez',
    notas_tecnicas: 'Disco duro mecánico con sectores dañados. Se migró sistema a SSD de 500GB. Windows 11 reinstalado y optimizado. Mejora significativa en rendimiento.',
    costo_final: 120.00,
    fecha_entrega: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Hace 2 días
  },
  {
    trackingId: 'WO-1009',
    cliente_nombre: 'Isabel Vargas Moreno',
    cliente_telefono: '555-0109',
    cliente_email: null,
    marca_equipo: 'Lenovo',
    modelo_equipo: 'IdeaPad 3',
    numero_serie: 'SN-LEN-009-2024',
    descripcion_problema: 'Bisagra de la pantalla rota, la tapa no se sostiene correctamente.',
    estado: 'ENTREGADO',
    costo_estimado: 65.00,
    tecnico_id: 2,
    tecnico_nombre: 'Luis Martínez Silva',
    notas_tecnicas: 'Bisagra izquierda fracturada. Se reemplazó bisagra completa y se reforzó el soporte plástico. Probado, movimiento suave y seguro.',
    costo_final: 70.00,
    fecha_entrega: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // Hace 5 días
  },
  
  // Órdenes SIN_REPARACION (no reparables o no autorizadas)
  {
    trackingId: 'WO-1010',
    cliente_nombre: 'Francisco Jiménez Ortiz',
    cliente_telefono: '555-0110',
    cliente_email: 'francisco.jimenez@example.com',
    marca_equipo: 'HP',
    modelo_equipo: 'EliteBook 840',
    numero_serie: 'SN-HP-010-2024',
    descripcion_problema: 'Golpeada, no enciende. Caída desde altura considerable.',
    estado: 'SIN_REPARACION',
    costo_estimado: 200.00,
    tecnico_id: 1,
    tecnico_nombre: 'Carlos Técnico Rodríguez',
    notas_tecnicas: 'Daño severo en placa madre por impacto. Múltiples componentes dañados (GPU, RAM slots, circuitos). Costo de reparación excede valor del equipo. Cliente notificado y rechazó reparación.',
    costo_final: 0.00,
    fecha_entrega: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Hace 1 día
  },
  
  // Órdenes CANCELADO (canceladas por cliente)
  {
    trackingId: 'WO-1011',
    cliente_nombre: 'Sofía Medina Reyes',
    cliente_telefono: '555-0111',
    cliente_email: 'sofia.medina@example.com',
    marca_equipo: 'Dell',
    modelo_equipo: 'XPS 13',
    numero_serie: 'SN-DELL-011-2024',
    descripcion_problema: 'Audio no funciona, no se escucha ningún sonido por los altavoces ni por los audífonos.',
    estado: 'CANCELADO',
    costo_estimado: 55.00,
    tecnico_id: null,
    tecnico_nombre: null,
    notas_tecnicas: 'Cliente canceló antes de iniciar revisión. Decidió comprar equipo nuevo.',
    costo_final: 0.00,
    fecha_entrega: null,
  },
  
  // Órdenes adicionales EN_ESPERA para testing
  {
    trackingId: 'WO-1012',
    cliente_nombre: 'Diego Alejandro Cruz',
    cliente_telefono: '555-0112',
    cliente_email: 'diego.cruz@example.com',
    marca_equipo: 'Acer',
    modelo_equipo: 'Swift 3',
    numero_serie: 'SN-ACER-012-2024',
    descripcion_problema: 'Wi-Fi no funciona, no detecta ninguna red inalámbrica disponible. Conexión por cable funciona correctamente.',
    estado: 'EN_ESPERA',
    costo_estimado: 45.00,
    tecnico_id: null,
    tecnico_nombre: null,
    notas_tecnicas: null,
    costo_final: null,
    fecha_entrega: null,
  },
  {
    trackingId: 'WO-1013',
    cliente_nombre: 'Valeria Castillo Flores',
    cliente_telefono: '555-0113',
    cliente_email: null,
    marca_equipo: 'Asus',
    modelo_equipo: 'ZenBook 14',
    numero_serie: 'SN-ASUS-013-2024',
    descripcion_problema: 'Trackpad no responde al tacto. El cursor no se mueve cuando uso el panel táctil, pero funciona con mouse externo.',
    estado: 'EN_ESPERA',
    costo_estimado: 35.00,
    tecnico_id: null,
    tecnico_nombre: null,
    notas_tecnicas: null,
    costo_final: null,
    fecha_entrega: null,
  },
];

async function main() {
  console.log('🚀 Iniciando seed de Work Orders...\n');

  // Limpiar órdenes de trabajo existentes (opcional)
  console.log('🗑️  Eliminando work orders existentes...');
  const deleted = await prisma.workOrder.deleteMany({});
  console.log(`   ✅ ${deleted.count} work orders eliminadas\n`);

  // Crear nuevas work orders
  console.log('📝 Creando work orders de ejemplo...');
  let created = 0;
  
  for (const orderData of workOrdersData) {
    try {
      await prisma.workOrder.create({
        data: orderData,
      });
      created++;
      console.log(`   ✅ ${orderData.trackingId} - ${orderData.cliente_nombre} (${orderData.estado})`);
    } catch (error) {
      console.error(`   ❌ Error creando ${orderData.trackingId}:`, error.message);
    }
  }

  console.log(`\n✨ Seed completado! ${created}/${workOrdersData.length} work orders creadas\n`);

  // Mostrar estadísticas
  const stats = await prisma.workOrder.groupBy({
    by: ['estado'],
    _count: true,
  });

  console.log('📊 Estadísticas por estado:');
  stats.forEach(stat => {
    console.log(`   ${stat.estado}: ${stat._count} órdenes`);
  });

  console.log('\n🎉 ¡Todo listo para empezar a trabajar con Work Orders!');
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
