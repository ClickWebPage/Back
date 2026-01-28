// Script para probar la conexión SMTP usando la configuración del .env (Gmail u otro proveedor)
const nodemailer = require('nodemailer');
require('dotenv').config();

async function testMailConnection() {
  console.log('\n=== TEST CONEXION SMTP (usando variables MAIL_*) ===\n');

  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.MAIL_PORT || '587', 10),
    secure: process.env.MAIL_SECURE === 'true',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
    debug: true, // Mostrar información detallada
    logger: true, // Registrar todo
  });

  try {
    console.log('1. Verificando conexión...');
    await transporter.verify();
    console.log('✅ Conexión SMTP exitosa!\n');

    console.log('2. Enviando email de prueba...');
    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM || process.env.MAIL_USER,
      to: process.env.MAIL_FROM || process.env.MAIL_USER, // Enviar a ti mismo
      subject: 'Test - Servidor de Correo CHPC',
      text: 'Este es un email de prueba desde el backend de CHPC.',
      html: '<b>Este es un email de prueba desde el backend de CHPC.</b>',
    });

    console.log('✅ Email enviado exitosamente!');
    console.log('   Message ID:', info.messageId);
    console.log('   Respuesta:', info.response);
    console.log('\n=== TEST COMPLETADO CON EXITO ===\n');
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error('\nDetalles del error:');
    console.error(error);
    console.log('\n=== POSIBLES SOLUCIONES ===');
    console.log('1. Verifica que el usuario (MAIL_USER) y la contraseña (MAIL_PASSWORD) sean correctos');
    console.log('2. Si usas Gmail:');
    console.log('   - Activa la verificación en dos pasos');
    console.log('   - Crea una "contraseña de aplicación" en https://myaccount.google.com/apppasswords');
    console.log('   - Usa esa contraseña en MAIL_PASSWORD');
    console.log('3. Verifica que el proveedor de correo no esté bloqueando el acceso SMTP');
  }
}

testMailConnection();
