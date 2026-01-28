# 🛠️ Guía de Resolución de Problemas CORS

## ❌ Error Actual
```
Access to XMLHttpRequest at 'https://chpc-webpage-back.vercel.app/api/tienda/productos' 
from origin 'https://frontend-chpc.vercel.app' has been blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## ✅ Solución Implementada

### 1. Archivos Modificados:

1. **`src/main.ts`**: Configuración CORS mejorada con logging
2. **`api/index.js`**: Añadido soporte para `frontend-chpc.vercel.app`
3. **`src/common/middleware/cors.middleware.ts`**: Middleware CORS adicional
4. **`src/app.module.ts`**: Integración del middleware

### 2. Cambios Principales:

- ✅ Añadido `https://frontend-chpc.vercel.app` a la lista de orígenes permitidos
- ✅ Configuración CORS con callback function para mejor control
- ✅ Headers CORS más completos
- ✅ Logging para debugging
- ✅ Middleware adicional como fallback
- ✅ Configuración mejorada para Vercel

### 3. Pasos para Aplicar la Solución:

```bash
# 1. Los cambios ya están aplicados en el código

# 2. Hacer deploy a Vercel
npm run build
vercel --prod

# 3. Configurar variable de entorno en Vercel Dashboard
CORS_ORIGIN=https://frontend-chpc.vercel.app,https://chpc-webpage-front.vercel.app
```

## 🔧 Configuración de Variables de Entorno en Vercel

1. Ve a https://vercel.com/dashboard
2. Selecciona tu proyecto `chpc-webpage-back`
3. Ve a Settings > Environment Variables
4. Añade:
   ```
   Name: CORS_ORIGIN
   Value: https://frontend-chpc.vercel.app,https://chpc-webpage-front.vercel.app
   ```
5. Haz un redeploy para que tome efecto

## 🧪 Verificar que Funciona

### Opción 1: Test Automatizado
```bash
node test-cors-fix.js
```

### Opción 2: Test Manual en Browser
```javascript
fetch('https://chpc-webpage-back.vercel.app/api/tienda/productos', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log('✅ CORS funcionando:', data))
.catch(error => console.error('❌ Error CORS:', error));
```

### Opción 3: Chrome DevTools
1. Abre https://frontend-chpc.vercel.app
2. Abre DevTools (F12)
3. Ve a la pestaña Network
4. Haz la petición que falló antes
5. Deberías ver los headers CORS en la respuesta:
   - `Access-Control-Allow-Origin: https://frontend-chpc.vercel.app`
   - `Access-Control-Allow-Methods: GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS`

## 🚨 Problemas Comunes

### Si aún no funciona:

1. **Cache del navegador**: Limpia cache o usa modo incógnito
2. **Variables de entorno**: Verifica que CORS_ORIGIN esté configurada en Vercel
3. **Deploy**: Asegúrate de que los cambios se desplegaron correctamente
4. **URL exacta**: Verifica que la URL del frontend coincida exactamente

### Verificar logs en Vercel:
1. Ve a https://vercel.com/dashboard
2. Selecciona tu proyecto
3. Ve a la pestaña "Functions"
4. Revisa los logs para ver mensajes de CORS

## 🔍 Debugging

Si necesitas más información, los logs mostrarán:
```
🔍 CORS Check - Origin: https://frontend-chpc.vercel.app
✅ CORS Permitido para: https://frontend-chpc.vercel.app
```

O si hay problemas:
```
❌ CORS Bloqueado para: https://otro-dominio.com
📝 Orígenes permitidos: [lista de orígenes]
```

## 📞 Contacto

Si el problema persiste, verifica:
1. Que el backend esté funcionando: https://chpc-webpage-back.vercel.app/api/health (si existe)
2. Que la URL del frontend sea exactamente: `https://frontend-chpc.vercel.app`
3. Que no haya proxies o CDNs intermedios cambiando el header Origin