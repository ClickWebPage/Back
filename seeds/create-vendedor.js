const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createVendedor() {
  try {
    console.log('👤 Creando usuario vendedor...\n');

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash('vendedor123', 10);

    const vendedor = await prisma.user.create({
      data: {
        nombre: 'Vendedor',
        apellido: 'Prueba',
        username: 'vendedor',
        email: 'vendedor@chpc.com',
        password: hashedPassword,
        telefono: '0987654321',
        direccion: 'Sucursal Centro',
        rol: 'vendedor'
      }
    });

    console.log('✅ Usuario vendedor creado exitosamente:');
    console.log('   Username: vendedor');
    console.log('   Password: vendedor123');
    console.log('   Rol: vendedor');
    console.log(`   ID: ${vendedor.id}\n`);
    console.log('🔐 Ahora puedes iniciar sesión en: http://localhost:8080/login');
    console.log('📊 Y acceder al panel en: http://localhost:8080/admin/panel');
    console.log('   (con permisos de solo lectura)\n');

  } catch (error) {
    if (error.code === 'P2002') {
      console.log('⚠️  El usuario "vendedor" ya existe en la base de datos');
      console.log('   Username: vendedor');
      console.log('   Password: vendedor123 (si no has cambiado la contraseña)\n');
    } else {
      console.error('❌ Error al crear usuario vendedor:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createVendedor();
