import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

let app;

async function createApp() {
  if (!app) {
    app = await NestFactory.create(AppModule);

    // Habilitar CORS para red local y producción
    const corsOrigin = process.env.CORS_ORIGIN || process.env.NODE_ENV === 'production' 
      ? ['https://your-frontend.vercel.app'] // Reemplaza con tu URL de frontend
      : '*';
    
    app.enableCors({
      origin: corsOrigin === '*' ? true : corsOrigin,
      credentials: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      allowedHeaders: 'Content-Type, Accept, Authorization',
    });

    // Prefijo global de rutas
    app.setGlobalPrefix('api');

    // Validación global de DTOs
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true, // Eliminar propiedades no definidas en el DTO
        forbidNonWhitelisted: true, // Lanzar error si hay propiedades extra
        transform: true, // Transformar tipos automáticamente
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    // Filtro global de excepciones
    app.useGlobalFilters(new HttpExceptionFilter());

    // Interceptor de logging
    app.useGlobalInterceptors(new LoggingInterceptor());

    // Configuración de Swagger (solo en desarrollo)
    if (process.env.NODE_ENV !== 'production') {
      const config = new DocumentBuilder()
        .setTitle('CHPC API')
        .setDescription('API de la tienda CHPC - Documentación completa de endpoints')
        .setVersion('1.0')
        .addBearerAuth(
          {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            name: 'JWT',
            description: 'Ingrese su token JWT',
            in: 'header',
          },
          'JWT-auth',
        )
        .build();

      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('api/docs', app, document);
    }

    await app.init();
  }
  return app;
}

async function bootstrap() {
  const app = await createApp();
  
  const port = process.env.PORT || 5000;
  await app.listen(port, '0.0.0.0'); // Escuchar en todas las interfaces de red
  
  // Solo mostrar información de red en desarrollo
  if (process.env.NODE_ENV !== 'production') {
    // Obtener la IP local
    const networkInterfaces = require('os').networkInterfaces();
    const localIP = Object.values(networkInterfaces)
      .flat()
      .filter((iface): iface is { family: string; internal: boolean; address: string } => 
        iface !== null && iface !== undefined
      )
      .find((iface) => iface.family === 'IPv4' && !iface.internal)?.address || 'localhost';
    
    console.log(`\n🚀 Servidor ejecutándose en:`);
    console.log(`   - Local: http://localhost:${port}`);
    console.log(`   - Red Local: http://${localIP}:${port}`);
    console.log(`\n📚 API disponible en:`);
    console.log(`   - Local: http://localhost:${port}/api`);
    console.log(`   - Red Local: http://${localIP}:${port}/api`);
    console.log(`\n📖 Documentación Swagger:`);
    console.log(`   - http://${localIP}:${port}/api/docs`);
    console.log(`\n🔐 Endpoints de autenticación:`);
    console.log(`   - POST http://${localIP}:${port}/api/auth/registro`);
    console.log(`   - POST http://${localIP}:${port}/api/auth/login`);
    console.log(`   - POST http://${localIP}:${port}/api/auth/refresh`);
    console.log(`   - GET  http://${localIP}:${port}/api/auth/verificar\n`);
  }
}

// Para desarrollo local
if (process.env.NODE_ENV !== 'production') {
  bootstrap();
}

// Para Vercel serverless
export default async (req, res) => {
  const app = await createApp();
  await app.getHttpAdapter().getInstance()(req, res);
};

// También exportar para compatibilidad
module.exports = async (req, res) => {
  const app = await createApp();
  await app.getHttpAdapter().getInstance()(req, res);
};
