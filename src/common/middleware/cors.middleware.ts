// src/common/middleware/cors.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class CorsMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const origin = req.headers.origin;
    const allowedOrigins = [
      'https://chpc-webpage-front.vercel.app',
      'https://frontend-chpc.vercel.app',
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:4173',
    ];

    // Log para debugging
    console.log(`🔍 Middleware CORS - Method: ${req.method}, Origin: ${origin}`);

    // Configurar headers CORS manualmente como fallback
    if (origin && allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
      console.log(`✅ Middleware CORS - Origin permitido: ${origin}`);
    } else if (!origin) {
      // Permitir requests sin origin
      res.header('Access-Control-Allow-Origin', '*');
      console.log(`✅ Middleware CORS - Sin origin, permitido`);
    }

    res.header('Access-Control-Allow-Credentials', 'true');
    res.header(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, PATCH, OPTIONS'
    );
    res.header(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, Accept, X-Requested-With, Origin, Cache-Control, X-File-Name'
    );
    res.header('Access-Control-Max-Age', '86400');

    // Manejar preflight requests
    if (req.method === 'OPTIONS') {
      console.log(`✅ Preflight request manejado para: ${origin}`);
      return res.status(200).end();
    }

    next();
  }
}