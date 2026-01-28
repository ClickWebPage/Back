// src/cors/cors.controller.ts
import { Controller, Get, Req, Res, Header } from '@nestjs/common';
import type { Request, Response } from 'express';

@Controller('cors')
export class CorsController {
  @Get('diagnostic')
  diagnostic(@Req() req: Request, @Res() res: Response) {
    const origin = req.headers.origin || 'No origin header';
    res.json({
      status: 'CORS Diagnostic',
      origin,
      headers: req.headers,
      allowed: true,
      message: 'Si ves esto, CORS está funcionando',
    });
  }

  @Get('headers')
  @Header('Access-Control-Expose-Headers', 'X-Custom-Header')
  @Header('X-Custom-Header', 'custom-value')
  checkHeaders() {
    return {
      message: 'Check headers in browser devtools',
      note: 'Look for X-Custom-Header in response headers',
    };
  }
}
