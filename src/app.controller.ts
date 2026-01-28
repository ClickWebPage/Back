import { Controller, Get, Header } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Header('Access-Control-Allow-Origin', '*')
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Get('secure')
  @Header('Access-Control-Allow-Origin', 'frontend-chpc.vercel.app')
  @Header('Access-Control-Allow-Credentials', 'true')
  getSecureData(): { data: string } {
    return { data: 'This is secure' };
  }
}
