// test-cors-fix.js
const https = require('https');

const testCorsRequest = () => {
  const options = {
    hostname: 'chpc-webpage-back.vercel.app',
    port: 443,
    path: '/api/tienda/productos',
    method: 'OPTIONS',
    headers: {
      'Origin': 'https://frontend-chpc.vercel.app',
      'Access-Control-Request-Method': 'GET',
      'Access-Control-Request-Headers': 'Content-Type,Authorization'
    }
  };

  console.log('🧪 Testing CORS preflight request...');
  console.log(`📍 URL: https://${options.hostname}${options.path}`);
  console.log(`🌐 Origin: ${options.headers.Origin}`);

  const req = https.request(options, (res) => {
    console.log('\n📊 Response Status:', res.statusCode);
    console.log('📋 Response Headers:');
    Object.keys(res.headers).forEach(key => {
      if (key.toLowerCase().includes('access-control') || key.toLowerCase().includes('origin')) {
        console.log(`  ${key}: ${res.headers[key]}`);
      }
    });

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('\n📄 Response Body:', data);
      
      // Verificar headers críticos
      const allowOrigin = res.headers['access-control-allow-origin'];
      const allowMethods = res.headers['access-control-allow-methods'];
      
      if (allowOrigin) {
        console.log('\n✅ CORS configurado correctamente!');
        console.log(`   Origin permitido: ${allowOrigin}`);
        if (allowMethods) {
          console.log(`   Métodos permitidos: ${allowMethods}`);
        }
      } else {
        console.log('\n❌ CORS NO configurado correctamente');
        console.log('   No se encontró header Access-Control-Allow-Origin');
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Error en la solicitud:', error.message);
  });

  req.end();
};

// También probar una solicitud GET normal
const testGetRequest = () => {
  const options = {
    hostname: 'chpc-webpage-back.vercel.app',
    port: 443,
    path: '/api/tienda/productos',
    method: 'GET',
    headers: {
      'Origin': 'https://frontend-chpc.vercel.app',
    }
  };

  console.log('\n\n🧪 Testing GET request...');

  const req = https.request(options, (res) => {
    console.log('\n📊 Response Status:', res.statusCode);
    console.log('📋 CORS Headers:');
    Object.keys(res.headers).forEach(key => {
      if (key.toLowerCase().includes('access-control') || key.toLowerCase().includes('origin')) {
        console.log(`  ${key}: ${res.headers[key]}`);
      }
    });

    const allowOrigin = res.headers['access-control-allow-origin'];
    if (allowOrigin) {
      console.log('\n✅ GET request - CORS OK');
    } else {
      console.log('\n❌ GET request - Sin CORS headers');
    }
  });

  req.on('error', (error) => {
    console.error('❌ Error en GET request:', error.message);
  });

  req.end();
};

// Ejecutar tests
testCorsRequest();
setTimeout(testGetRequest, 2000);