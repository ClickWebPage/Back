import { Controller, Get, Header, Req } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Header('Content-Type', 'text/html')
  async getHomePage(): Promise<string> {
    const status = await this.appService.getSystemStatus();
    
    const hasErrors = status.errors.length > 0;
    const hasWarnings = status.warnings.length > 0;
    const overallStatus = hasErrors ? 'error' : hasWarnings ? 'warning' : 'ok';
    
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CHPC Backend API</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            max-width: 900px;
            width: 100%;
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
        }
        .header p {
            font-size: 1.1rem;
            opacity: 0.9;
        }
        .status-badge {
            display: inline-block;
            padding: 8px 20px;
            border-radius: 20px;
            font-weight: bold;
            margin-top: 15px;
            font-size: 0.9rem;
        }
        .status-ok { background: #10b981; color: white; }
        .status-warning { background: #f59e0b; color: white; }
        .status-error { background: #ef4444; color: white; }
        .content {
            padding: 40px;
        }
        .section {
            margin-bottom: 30px;
        }
        .section h2 {
            font-size: 1.5rem;
            color: #333;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }
        .info-card {
            background: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 15px;
            border-radius: 8px;
        }
        .info-card.success { border-left-color: #10b981; }
        .info-card.error { border-left-color: #ef4444; }
        .info-card.warning { border-left-color: #f59e0b; }
        .info-card h3 {
            font-size: 0.85rem;
            color: #666;
            text-transform: uppercase;
            margin-bottom: 8px;
        }
        .info-card p {
            font-size: 1.1rem;
            color: #333;
            font-weight: 600;
        }
        .info-card small {
            font-size: 0.85rem;
            color: #666;
        }
        .endpoints {
            list-style: none;
        }
        .endpoints li {
            background: #f8f9fa;
            padding: 12px 15px;
            margin-bottom: 8px;
            border-radius: 6px;
            font-family: 'Courier New', monospace;
            font-size: 0.9rem;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .endpoints li span {
            color: #667eea;
            font-weight: bold;
        }
        .alert {
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 15px;
        }
        .alert-error {
            background: #fee2e2;
            border-left: 4px solid #ef4444;
            color: #991b1b;
        }
        .alert-warning {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            color: #92400e;
        }
        .alert h4 {
            margin-bottom: 8px;
            font-weight: bold;
        }
        .alert ul {
            margin-left: 20px;
        }
        .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #666;
            font-size: 0.9rem;
        }
        .icon {
            font-size: 1.2rem;
        }
        @media (max-width: 768px) {
            .header h1 { font-size: 2rem; }
            .content { padding: 20px; }
            .info-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 CHPC Backend API</h1>
            <p>Sistema de Gestión - Centro de Hardware y PC</p>
            <span class="status-badge status-${overallStatus}">
                ${overallStatus === 'ok' ? '✓ Operativo' : overallStatus === 'warning' ? '⚠ Advertencias' : '✗ Errores'}
            </span>
        </div>
        
        <div class="content">
            ${hasErrors ? `
            <div class="alert alert-error">
                <h4>🚨 Errores Detectados:</h4>
                <ul>
                    ${status.errors.map(err => `<li>${err}</li>`).join('')}
                </ul>
            </div>
            ` : ''}
            
            ${hasWarnings ? `
            <div class="alert alert-warning">
                <h4>⚠️ Advertencias:</h4>
                <ul>
                    ${status.warnings.map(warn => `<li>${warn}</li>`).join('')}
                </ul>
            </div>
            ` : ''}
            
            <div class="section">
                <h2><span class="icon">📊</span> Estado del Sistema</h2>
                <div class="info-grid">
                    <div class="info-card success">
                        <h3>Servidor</h3>
                        <p>✓ ${status.server.status.toUpperCase()}</p>
                        <small>Versión ${status.server.version}</small>
                    </div>
                    <div class="info-card ${status.database.status === 'connected' ? 'success' : 'error'}">
                        <h3>Base de Datos</h3>
                        <p>${status.database.status === 'connected' ? '✓' : '✗'} ${status.database.status.toUpperCase()}</p>
                        <small>${status.database.message}</small>
                    </div>
                    <div class="info-card">
                        <h3>Entorno</h3>
                        <p>${status.server.environment}</p>
                        <small>Uptime: ${Math.floor(status.server.uptime / 60)}m</small>
                    </div>
                    <div class="info-card">
                        <h3>Timestamp</h3>
                        <p>${new Date(status.server.timestamp).toLocaleTimeString('es-ES')}</p>
                        <small>${new Date(status.server.timestamp).toLocaleDateString('es-ES')}</small>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <h2><span class="icon">🔗</span> Endpoints Disponibles</h2>
                <ul class="endpoints">
                    <li><span>GET</span> /api → Información de la API</li>
                    <li><span>GET</span> /health → Health check</li>
                    <li><span>POST</span> /api/auth/login → Autenticación</li>
                    <li><span>GET</span> /api/tienda/productos → Productos</li>
                    <li><span>GET</span> /api/tienda/banners → Banners</li>
                    <li><span>GET</span> /api/usuarios → Usuarios</li>
                    <li><span>GET</span> /api/ordenes → Órdenes</li>
                    <li><span>GET</span> /images → Imágenes</li>
                </ul>
            </div>
            
            <div class="section">
                <h2><span class="icon">📚</span> Documentación</h2>
                <p style="color: #666; margin-bottom: 10px;">
                    Para más información sobre los endpoints disponibles, consulta la documentación de Swagger (si está habilitada).
                </p>
            </div>
        </div>
        
        <div class="footer">
            <p>CHPC Backend API © ${new Date().getFullYear()} | Desarrollado con NestJS y PostgreSQL</p>
        </div>
    </div>
</body>
</html>
    `;
  }

  @Get('api')
  getApiInfo(): any {
    return {
      message: 'CHPC API - Backend funcionando correctamente',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      endpoints: {
        auth: '/api/auth',
        products: '/api/tienda/productos',
        banners: '/api/tienda/banners',
        users: '/api/usuarios',
        orders: '/api/ordenes',
        images: '/images'
      }
    };
  }

  @Get('health')
  async healthCheck(): Promise<any> {
    const status = await this.appService.getSystemStatus();
    
    return {
      status: status.errors.length === 0 ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      message: status.errors.length === 0 ? 'API funcionando correctamente' : 'Errores detectados',
      details: {
        server: status.server.status,
        database: status.database.status,
        errors: status.errors,
        warnings: status.warnings,
      }
    };
  }

  // Endpoint de debug para capturar URLs problemáticas
  @Get('debug/*')
  debugRoutes(@Req() req: any): any {
    console.log('🚨 DEBUG: URL problemática detectada:', {
      originalUrl: req.originalUrl,
      path: req.path,
      params: req.params,
      query: req.query,
      headers: {
        'user-agent': req.headers['user-agent'],
        'referer': req.headers['referer'],
        'origin': req.headers['origin']
      },
      timestamp: new Date().toISOString()
    });
    
    return {
      error: 'URL problemática detectada',
      receivedUrl: req.originalUrl,
      suggestedFix: 'Revisar concatenación de URLs en el frontend',
      timestamp: new Date().toISOString()
    };
  }
}
