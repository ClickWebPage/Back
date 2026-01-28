import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // SOLUCIÓN MÍNIMA: Solo esto debería funcionar
  app.enableCors({
    origin: 'https://chpc-webpage-front.vercel.app',
    credentials: true,
  });

  // Middleware OPTIONS explícito
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'OPTIONS') {
      res.header(
        'Access-Control-Allow-Origin',
        'https://chpc-webpage-front.vercel.app',
      );
      res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.header('Access-Control-Allow-Credentials', 'true');
      return res.status(204).send();
    }
    next();
  });

  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT || 5000);
  console.log('✅ Servidor listo con CORS configurado');
}

bootstrap();