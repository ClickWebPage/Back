const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/app.module');
const { ValidationPipe } = require('@nestjs/common');

let app;

const createNestServer = async () => {
  if (!app) {
    app = await NestFactory.create(AppModule);
    
    // Configuración CORS específica para Vercel
    // IMPORTANTE: Asegúrate de configurar CORS_ORIGIN en las variables de entorno de Vercel
    const allowedOrigins = process.env.CORS_ORIGIN 
      ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
      : ['https://chpc-webpage-front.vercel.app'];

    app.enableCors({
      origin: (origin, callback) => {
        // Permitir requests sin origin (como Postman o servidor a servidor)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          console.log(`❌ CORS bloqueado para origen: ${origin}`);
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      allowedHeaders: 'Content-Type, Accept, Authorization',
      exposedHeaders: 'Content-Range, X-Content-Range',
      maxAge: 3600,
    });

    app.setGlobalPrefix('api');
    
    // Ensure all hooks are called in the exact same order
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

    await app.init();
    console.log('✅ Serverless function inicializada con CORS');
    console.log(`✅ Orígenes permitidos: ${allowedOrigins.join(', ')}`);
  }
  return app;
};

module.exports = async (req, res) => {
  try {
    const server = await createNestServer();
    return server.getHttpAdapter().getInstance()(req, res);
  } catch (error) {
    console.error('❌ Error en serverless function:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message 
    });
  }
};
