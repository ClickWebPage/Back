import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path';
import * as fs from 'fs';

// Configuración de orígenes permitidos para CORS
const allowedOrigins: string[] = [
  'http://localhost:8080',
  'http://localhost:5000',
  'http://0.0.0.0:8080',
  'http://0.0.0.0:5000',
  'https://chpcecuador.com',
  'https://www.chpcecuador.com',
  'http://chpcecuador.com',
  'http://www.chpcecuador.com',
];

// Agregar orígenes adicionales desde variable de entorno
// Ejemplo: CORS_ORIGIN=https://chpc-frontend-xxx.traefik.me,https://mi-dominio.com
const envOrigins = process.env.CORS_ORIGIN;
if (envOrigins) {
  envOrigins.split(',').forEach(origin => {
    const trimmed = origin.trim();
    if (trimmed && !allowedOrigins.includes(trimmed)) {
      allowedOrigins.push(trimmed);
    }
  });
}

// También agregar FRONTEND_URL si está definida
const frontendUrl = process.env.FRONTEND_URL;
if (frontendUrl && !allowedOrigins.includes(frontendUrl.trim())) {
  allowedOrigins.push(frontendUrl.trim());
}

async function createApp(): Promise<NestExpressApplication> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  console.log('🔒 CORS habilitado para:', allowedOrigins);

  app.enableCors({
    origin: (origin, callback) => {
      // Permitir requests sin origin (curl, healthchecks, Postman)
      if (!origin) {
        return callback(null, true);
      }
      // Permitir orígenes en la lista
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      // Permitir cualquier subdominio *.traefik.me (dominios de Dokploy)
      if (/\.traefik\.me$/.test(origin)) {
        return callback(null, true);
      }
      // Permitir cualquier subdominio *.easypanel.host (dominios de Easypanel)
      if (/\.easypanel\.host$/.test(origin)) {
        return callback(null, true);
      }
      console.warn(`⚠️ CORS bloqueó origen: ${origin}`);
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type', 
      'Accept', 
      'Authorization', 
      'X-Requested-With',
      'Access-Control-Allow-Headers',
      'Origin',
      'X-Requested-With',
      'Accept',
      'Content-Type',
      'Access-Control-Request-Method',
      'Access-Control-Request-Headers'
    ],
    exposedHeaders: ['Content-Length', 'Content-Type'],
    optionsSuccessStatus: 200,
    preflightContinue: false,
  });

  // Prefijo global de rutas (excepto health check)
  app.setGlobalPrefix('api', {
    exclude: ['/', 'health'],
  });

  // Endpoint raíz para health check (fuera del prefijo /api)
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.get('/', (_req: any, res: any) => {
    res.json({ status: 'ok', message: 'CHPC Backend running' });
  });
  expressApp.get('/health', (_req: any, res: any) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Validación global de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Filtro global de excepciones
  app.useGlobalFilters(new HttpExceptionFilter());

  // Interceptor de logging
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Configuración de Swagger
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

  // Configurar directorio de archivos estáticos para imágenes
  const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '..', 'public');
  
  // Asegurar que el directorio de uploads existe (con subdirectorios)
  const productosDir = path.join(uploadDir, 'productos');
  try {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log('✅ Directorio de uploads creado:', uploadDir);
    }
    if (!fs.existsSync(productosDir)) {
      fs.mkdirSync(productosDir, { recursive: true });
      console.log('✅ Subdirectorio de productos creado:', productosDir);
    }
    // Intentar establecer permisos (puede fallar en Windows o sin permisos)
    try {
      fs.chmodSync(uploadDir, 0o755);
      fs.chmodSync(productosDir, 0o755);
    } catch (permError) {
      console.warn('⚠️ No se pudieron establecer permisos (ignorando):', permError.message);
    }
  } catch (error) {
    console.error('❌ Error creando directorio de uploads:', error);
  }
  
  app.useStaticAssets(uploadDir, {
    prefix: '/uploads/',
  });
  console.log('📁 Archivos estáticos servidos desde:', uploadDir);
  console.log('📁 Ruta completa productos:', productosDir);

  return app;
}

// Iniciar aplicación
async function bootstrap() {
  const app = await createApp();
  
  const port = process.env.PORT || 5000;
  await app.listen(port, '0.0.0.0');
  
  console.log(`\n🚀 Servidor ejecutándose en:`);
  console.log(`   - Local: http://localhost:${port}`);
  console.log(`\n📚 API disponible en:`);
  console.log(`   - http://localhost:${port}/api`);
  console.log(`\n📖 Documentación Swagger:`);
  console.log(`   - http://localhost:${port}/api/docs\n`);
}

bootstrap();
