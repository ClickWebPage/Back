import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuración CORS mejorada con logging
  const allowedOrigins = [
    'https://chpc-webpage-front.vercel.app',
    'https://frontend-chpc.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:4173', // Vite preview
  ];

  app.enableCors({
    origin: function (origin, callback) {
      // Permitir requests sin origin (como Postman, mobile apps, etc.)
      if (!origin) return callback(null, true);
      
      // Log para debugging
      console.log(`🔍 CORS Check - Origin: ${origin}`);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        console.log(`✅ CORS Permitido para: ${origin}`);
        callback(null, true);
      } else {
        console.log(`❌ CORS Bloqueado para: ${origin}`);
        console.log(`📝 Orígenes permitidos:`, allowedOrigins);
        callback(new Error('Not allowed by CORS'), false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'X-Requested-With',
      'Origin',
      'Cache-Control',
      'X-File-Name',
    ],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400, // 24 horas
    preflightContinue: false,
    optionsSuccessStatus: 200,
  });

  app.setGlobalPrefix('api');

  const port = process.env.PORT || 5000;
  await app.listen(port);

  console.log(`✅ Servidor corriendo en puerto ${port}`);
  console.log(`✅ CORS configurado para:`);
  console.log(`   - https://chpc-webpage-front.vercel.app`);
  console.log(`   - https://frontend-chpc.vercel.app`);
  console.log(`   - Desarrollo local (localhost:3000, localhost:5173)`);
}

bootstrap();
