#!/usr/bin/env bash

# Deploy script para Vercel con verificación CORS
echo "🚀 Iniciando deploy a Vercel..."

# Verificar que tenemos vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI no está instalado"
    echo "💡 Instálalo con: npm install -g vercel"
    exit 1
fi

echo "📦 Instalando dependencias..."
npm install

echo "🔨 Building aplicación..."
npm run build

echo "🚀 Desplegando a Vercel..."
vercel --prod

echo "⏳ Esperando que el deploy se complete..."
sleep 10

echo "🧪 Probando CORS después del deploy..."
node test-cors-fix.js

echo "✅ Deploy completado!"
echo ""
echo "🔧 Recuerda configurar las variables de entorno en Vercel:"
echo "   - CORS_ORIGIN=https://frontend-chpc.vercel.app,https://chpc-webpage-front.vercel.app"
echo "   - Otras variables según tu .env"
echo ""
echo "🌐 Ve a https://vercel.com/dashboard para configurar las variables"