// Script para generar JWT Secrets seguros para producción
// Uso: node generate-jwt-secrets.js

const crypto = require('crypto');

console.log('\n🔐 Generando JWT Secrets seguros...\n');
console.log('━'.repeat(80));

const jwtSecret = crypto.randomBytes(64).toString('hex');
const jwtRefreshSecret = crypto.randomBytes(64).toString('hex');

console.log('\n✅ Secrets generados exitosamente:\n');
console.log('📋 Copia estos valores en las variables de entorno de tu backend en Dokploy:\n');
console.log('━'.repeat(80));
console.log(`JWT_SECRET=${jwtSecret}`);
console.log('━'.repeat(80));
console.log(`JWT_REFRESH_SECRET=${jwtRefreshSecret}`);
console.log('━'.repeat(80));

console.log('\n⚠️  IMPORTANTE:');
console.log('   - Nunca compartas estos valores');
console.log('   - No los subas a GitHub');
console.log('   - Úsalos solo en Dokploy para producción');
console.log('   - Guárdalos en un lugar seguro (gestor de contraseñas)\n');

// Guardar en archivo temporal (solo para referencia local, NO subir a GitHub)
const fs = require('fs');
const content = `# JWT Secrets generados el ${new Date().toISOString()}
# ⚠️ NO SUBIR ESTE ARCHIVO A GITHUB
# Usar solo en Dokploy

JWT_SECRET=${jwtSecret}
JWT_REFRESH_SECRET=${jwtRefreshSecret}
`;

fs.writeFileSync('.jwt-secrets-temp.txt', content);
console.log('💾 Secrets guardados temporalmente en: .jwt-secrets-temp.txt');
console.log('   (Este archivo está en .gitignore y NO se subirá a GitHub)\n');
