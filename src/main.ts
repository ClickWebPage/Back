import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuración CORS limpia y específica
  app.enableCors({
    origin: [
      'https://chpc-webpage-front.vercel.app',
      'http://localhost:3000', // Para desarrollo local
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 3600, // Cache preflight requests por 1 hora
  });

  app.setGlobalPrefix('api');

  const port = process.env.PORT || 5000;
  await app.listen(port);

  console.log(`✅ Servidor corriendo en puerto ${port}`);
  console.log(
    `✅ CORS configurado para: https://chpc-webpage-front.vercel.app`,
  );
}

bootstrap();
