const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const users = [
  // Admin principal
  {
    nombre: 'Admin',
    apellido: 'Principal',
    username: 'admin',
    email: 'admin@chpc.com',
    password: 'Admin123',
    telefono: '123456789',
    direccion: 'Oficina Central',
    rol: 'administrador',
  },
  // Técnicos
  {
    nombre: 'Tecnico',
    apellido: 'Soporte',
    username: 'tecnico1',
    email: 'tecnico1@chpc.com',
    password: 'Tecnico123',
    telefono: '987654321',
    direccion: 'Taller Central',
    rol: 'tecnico',
  },
  {
    nombre: 'Tecnico',
    apellido: 'Secundario',
    username: 'tecnico2',
    email: 'tecnico2@chpc.com',
    password: 'Tecnico123',
    telefono: '987654322',
    direccion: 'Taller Secundario',
    rol: 'tecnico',
  },
  // Vendedores
  {
    nombre: 'Vendedor',
    apellido: 'Centro',
    username: 'vendedor1',
    email: 'vendedor1@chpc.com',
    password: 'Vendedor123',
    telefono: '555111222',
    direccion: 'Sucursal Centro',
    rol: 'vendedor',
  },
  {
    nombre: 'Vendedor',
    apellido: 'Norte',
    username: 'vendedor2',
    email: 'vendedor2@chpc.com',
    password: 'Vendedor123',
    telefono: '555111223',
    direccion: 'Sucursal Norte',
    rol: 'vendedor',
  },
  // Clientes de prueba
  {
    nombre: 'Juan',
    apellido: 'Cliente',
    username: 'cliente1',
    email: 'cliente1@chpc.com',
    password: 'Cliente123',
    telefono: '700000001',
    direccion: 'Direccion Cliente 1',
    rol: 'cliente',
  },
  {
    nombre: 'Maria',
    apellido: 'Cliente',
    username: 'cliente2',
    email: 'cliente2@chpc.com',
    password: 'Cliente123',
    telefono: '700000002',
    direccion: 'Direccion Cliente 2',
    rol: 'cliente',
  },
  {
    nombre: 'Pedro',
    apellido: 'Cliente',
    username: 'cliente3',
    email: 'cliente3@chpc.com',
    password: 'Cliente123',
    telefono: '700000003',
    direccion: 'Direccion Cliente 3',
    rol: 'cliente',
  },
];

async function main() {
  console.log('👥 Iniciando seeding de usuarios de prueba...');

  for (const user of users) {
    try {
      // Verificar si ya existe por username o email
      const existing = await prisma.user.findFirst({
        where: {
          OR: [{ username: user.username }, { email: user.email }],
        },
      });

      if (existing) {
        console.log(`⚠️  Usuario ya existe, se omite: ${user.username} (${user.email})`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(user.password, 10);

      const created = await prisma.user.create({
        data: {
          nombre: user.nombre,
          apellido: user.apellido,
          username: user.username,
          email: user.email,
          password: hashedPassword,
          telefono: user.telefono,
          direccion: user.direccion,
          rol: user.rol,
        },
      });

      console.log(`✅ Usuario creado: ${created.username} (rol: ${created.rol})`);
    } catch (error) {
      console.error(`❌ Error al crear usuario ${user.username}:`, error.message || error);
    }
  }

  console.log('\n🎉 Seeding de usuarios completado');
}

main()
  .catch((e) => {
    console.error('❌ Error general durante el seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
