const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/app.module');
const { ValidationPipe } = require('@nestjs/common');

let app;

const createNestServer = async () => {
  if (!app) {
    app = await NestFactory.create(AppModule);
    
    // Configuración CORS específica para Vercel
    // IMPORTANTE: Lista completa de orígenes permitidos
    const allowedOrigins = process.env.CORS_ORIGIN 
      ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
      : [
          'https://chpc-webpage-front.vercel.app',
          'https://frontend-chpc.vercel.app',
          'https://frontend-chpc.vercel.app', // Dominio principal del frontend
        ];

    console.log('🔧 CORS Configuración para Vercel:', allowedOrigins);

    app.enableCors({
      origin: (origin, callback) => {
        // Permitir requests sin origin (como Postman o servidor a servidor)
        if (!origin) {
          console.log('✅ Request sin origin permitido');
          return callback(null, true);
        }
        
        console.log(`🔍 Verificando origin: ${origin}`);
        
        if (allowedOrigins.includes(origin)) {
          console.log(`✅ Origin permitido: ${origin}`);
          callback(null, true);
        } else {
          console.log(`❌ CORS bloqueado para origen: ${origin}`);
          console.log(`📝 Orígenes permitidos:`, allowedOrigins);
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      allowedHeaders: [
        'Content-Type', 
        'Accept', 
        'Authorization',
        'X-Requested-With',
        'Origin',
        'Cache-Control',
      ],
      exposedHeaders: 'Content-Range, X-Content-Range',
      maxAge: 86400, // 24 horas
      preflightContinue: false,
      optionsSuccessStatus: 200,
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
