const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('👤 Creando usuario administrador...\n');

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = await prisma.user.create({
      data: {
        nombre: 'Sistema',
        apellido: 'Sistema',
        username: 'admin1',
        email: 'admin1@chpc.com',
        password: hashedPassword,
        telefono: '1234567890',
        direccion: 'Oficina Central',
        rol: 'administrador'
      }
    });

    console.log('✅ Usuario administrador creado exitosamente:');
    console.log('   Username: admin1');
    console.log('   Password: admin123');
    console.log('   Rol: administrador');
    console.log(`   ID: ${admin.id}\n`);
    console.log('🔐 Ahora puedes iniciar sesión en: http://localhost:8080/login');
    console.log('📊 Y acceder al panel en: http://localhost:8080/admin/panel\n');

  } catch (error) {
    if (error.code === 'P2002') {
      console.log('⚠️  El usuario "admin1" ya existe en la base de datos');
      console.log('   Username: admin');
      console.log('   Password: admin123 (si no has cambiado la contraseña)\n');
    } else {
      console.error('❌ Error al crear usuario administrador:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
