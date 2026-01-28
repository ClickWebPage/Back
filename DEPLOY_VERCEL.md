# 🚀 Comandos de Build y Output para Vercel

## ✅ Configuración Actualizada

### Build Commands
```json
{
  "buildCommand": "npm run vercel-build",
  "installCommand": "npm install",
  "outputDirectory": "dist"
}
```

### Scripts en Package.json
```json
{
  "scripts": {
    "build": "nest build",
    "vercel-build": "npx prisma generate && npm run build",
    "start:prod": "node dist/main"
  }
}
```

### Estructura de Archivos
```
├── api/
│   └── index.js          # Entry point para Vercel
├── vercel.json           # Configuración de Vercel
├── package.json          # Scripts de build
└── dist/                 # Output del build
    └── main.js           # Aplicación compilada
```

## 🔧 Configuración de Vercel.json

El archivo `vercel.json` está configurado para:

- **Build**: Ejecutar `npm run vercel-build`
- **Entry Point**: `api/index.js` como función serverless
- **Routes**: Todas las rutas van al entry point
- **Environment**: NODE_ENV=production

## 📝 Pasos para Deploy

### 1. En el Dashboard de Vercel

Cuando configures tu proyecto en Vercel, usa estos comandos:

```
Framework Preset: Other
Build Command: npm run vercel-build
Output Directory: (dejar vacío)
Install Command: npm install
Development Command: npm run start:dev
```

### 2. Variables de Entorno Requeridas

```
DATABASE_URL=postgresql://usuario:password@host:5432/db
JWT_SECRET=tu-jwt-secret-super-seguro
JWT_REFRESH_SECRET=tu-refresh-secret-super-seguro
NODE_ENV=production
CORS_ORIGIN=https://tu-frontend.vercel.app
```

### 1. Instalar Vercel CLI (opcional)
```bash
npm i -g vercel
```

### 2. Deploy desde GitHub (Recomendado)

1. **Sube tu código a GitHub** si no lo has hecho
2. **Ve a [vercel.com](https://vercel.com)** e inicia sesión
3. **Conecta tu repositorio** y selecciona esta carpeta como proyecto
4. **Configura las variables de entorno** (ver sección abajo)

### 3. Deploy directo desde CLI (Alternativa)
```bash
# En esta carpeta del proyecto
vercel --prod
```

## 🔧 Variables de Entorno en Vercel

Ve a tu proyecto en Vercel → Settings → Environment Variables y añade:

```
DATABASE_URL = postgresql://usuario:password@host:5432/db
JWT_SECRET = tu-jwt-secret-super-seguro
JWT_REFRESH_SECRET = tu-refresh-secret-super-seguro
NODE_ENV = production
CORS_ORIGIN = https://tu-frontend.vercel.app
```

### 📊 Base de Datos

**Opción 1: Vercel Postgres (Recomendado)**
```bash
# En el dashboard de Vercel, añadir "Postgres" database
# Vercel automáticamente configurará DATABASE_URL
```

**Opción 2: PostgreSQL Externa**
- Railway, Supabase, PlanetScale, etc.
- Configurar manualmente DATABASE_URL

## 🔗 URLs Resultantes

Después del deploy, tendrás:

- **API Base**: `https://tu-proyecto.vercel.app/api`
- **Docs**: `https://tu-proyecto.vercel.app/api/docs` (solo en desarrollo)
- **Auth**: `https://tu-proyecto.vercel.app/api/auth/login`

## ⚡ Configuración del Frontend

En tu frontend, cambia la URL base de la API a:
```javascript
const API_URL = 'https://tu-proyecto-backend.vercel.app/api'
```

## 🐛 Troubleshooting

### Error de CORS
- Actualizar CORS_ORIGIN con la URL exacta de tu frontend
- Verificar que coincida exactamente (https vs http)

### Error de Base de Datos
- Verificar DATABASE_URL en variables de entorno
- Ejecutar migraciones: `npx prisma db push`

### Error de Build
- Verificar que todas las dependencias estén en package.json
- Revisar logs de build en el dashboard de Vercel

## 💡 Tips

1. **Testing**: Prueba la API con tools como Postman usando la URL de producción
2. **Logs**: Ve a Vercel Dashboard → Functions → Ver logs en tiempo real  
3. **Rollback**: Vercel permite rollback instantáneo a versiones anteriores