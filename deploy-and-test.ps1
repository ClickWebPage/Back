# Deploy script para Vercel con verificación CORS (PowerShell)
Write-Host "🚀 Iniciando deploy a Vercel..." -ForegroundColor Green

# Verificar que tenemos vercel CLI
try {
    vercel --version | Out-Null
} catch {
    Write-Host "❌ Vercel CLI no está instalado" -ForegroundColor Red
    Write-Host "💡 Instálalo con: npm install -g vercel" -ForegroundColor Yellow
    exit 1
}

Write-Host "📦 Instalando dependencias..." -ForegroundColor Blue
npm install

Write-Host "🔨 Building aplicación..." -ForegroundColor Blue
npm run build

Write-Host "🚀 Desplegando a Vercel..." -ForegroundColor Green
vercel --prod

Write-Host "⏳ Esperando que el deploy se complete..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host "🧪 Probando CORS después del deploy..." -ForegroundColor Blue
node test-cors-fix.js

Write-Host "✅ Deploy completado!" -ForegroundColor Green
Write-Host ""
Write-Host "🔧 Recuerda configurar las variables de entorno en Vercel:" -ForegroundColor Yellow
Write-Host "   - CORS_ORIGIN=https://frontend-chpc.vercel.app,https://chpc-webpage-front.vercel.app" -ForegroundColor Cyan
Write-Host "   - Otras variables según tu .env" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 Ve a https://vercel.com/dashboard para configurar las variables" -ForegroundColor Magenta