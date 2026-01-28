import { Controller, Get, Header } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // ELIMINA estos headers redundantes - CORS ya está configurado en main.ts
  // ¡No necesitas @Header() si ya configuraste app.enableCors()!
  @Get('secure')
  getSecureData(): { data: string } {
    return { data: 'This is secure' };
  }

  // Opcional: Endpoint para testear CORS
  @Get('cors-test')
  testCors() {
    return {
      message: 'CORS funcionando correctamente',
      timestamp: new Date().toISOString(),
      allowedOrigins: [
        'https://chpc-webpage-front.vercel.app',
        'https://frontend-chpc.vercel.app',
        'http://localhost:3000',
      ],
    };
  }
}
