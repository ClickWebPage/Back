# 🚀 Configuración de Despliegue - Dokploy + GoDaddy

> ⚠️ **IMPORTANTE**: Este proyecto usa **Docker Standalone**, NO Docker Swarm.  
> Si tienes dudas sobre la configuración, revisa: [frontend/DOKPLOY_STANDALONE_CONFIG.md](../../frontend/DOKPLOY_STANDALONE_CONFIG.md)

---

## ❌ Problemas Identificados

### 1. Backend - Variables de Entorno Incorrectas
- ❌ Usa `http://` cuando Traefik usa `https://`
- ❌ Falta agregar dominio de GoDaddy

### 2. Frontend - Variables de Entorno Incorrectas  
- ❌ Falta el protocolo `https://` en la URL del backend
- ⚠️ Posible typo: "hpc-backend" vs "chpc-backend"

### 3. Dominio de GoDaddy
- ❌ No está configurado en las variables de entorno
- ❌ Falta configuración DNS

---

## ✅ Configuración Correcta

### 📦 Backend (Dokploy)

```bash
# Entorno
NODE_ENV=production
PORT=5000

# Base de Datos (ya está correcta)
DATABASE_URL=postgresql://postgres:Humbug0809@chpc-database-sev7k6:5432/chpc-webpage

# JWT Secrets (GENERAR NUEVOS EN PRODUCCIÓN)
JWT_SECRET=<tu-jwt-secret-seguro-generado-con-crypto>
JWT_REFRESH_SECRET=<tu-refresh-secret-seguro-generado-con-crypto>

# CORS - Orígenes Permitidos (separados por comas)
# ⚠️ IMPORTANTE: Usar HTTPS en producción
CORS_ORIGIN=https://chpc-frontend-rrp6aj-18e970-45-88-188-111.traefik.me,https://www.tudominio.com,https://tudominio.com

# URL del Frontend
FRONTEND_URL=https://chpc-frontend-rrp6aj-18e970-45-88-188-111.traefik.me

# Directorio de subida de archivos
UPLOAD_DIR=/mnt/multimedia
```

**NOTA**: Si tu dominio de GoDaddy es, por ejemplo, `www.chpc.com`, agrégalo a `CORS_ORIGIN`:
```bash
CORS_ORIGIN=https://chpc-frontend-rrp6aj-18e970-45-88-188-111.traefik.me,https://www.chpc.com,https://chpc.com
```

---

### 🎨 Frontend (Dokploy)

```bash
# URL del Backend - DEBE incluir https://
# ⚠️ VERIFICA que la URL sea correcta (parece haber un typo "hpc" vs "chpc")
VUE_APP_API_URL=https://chpc-backend-mrdcx4-0db854-45-88-188-111.traefik.me/api

# Si prefieres usar tu dominio de GoDaddy apuntando al backend:
# VUE_APP_API_URL=https://api.tudominio.com/api

# Proxy deshabilitado (conexión directa al backend)
VUE_APP_API_PROXY=false

# Entorno de producción
NODE_ENV=production
```

**IMPORTANTE**: La URL actual en tu configuración es:
```
hpc-backend-mrdcx4-0db854-45-88-188-111.traefik.me/api
```

Verifica si debería ser:
```
chpc-backend-mrdcx4-0db854-45-88-188-111.traefik.me/api
```

---

## 🌐 Configuración del Dominio de GoDaddy

### Paso 1: Configurar DNS en GoDaddy

Necesitas agregar estos registros DNS en tu panel de GoDaddy:

#### Opción A: Apuntar ambos servicios al dominio principal

```
Tipo    Nombre              Valor                                          TTL
A       @                   45.88.188.111                                  600
A       www                 45.88.188.111                                  600
CNAME   api                 chpc-backend-mrdcx4-0db854-45-88-188-111.traefik.me    600
```

#### Opción B: Usar subdominios (RECOMENDADO)

```
Tipo    Nombre              Valor                                          TTL
A       @                   45.88.188.111                                  600  
CNAME   www                 chpc-frontend-rrp6aj-18e970-45-88-188-111.traefik.me   600
CNAME   api                 chpc-backend-mrdcx4-0db854-45-88-188-111.traefik.me    600
```

**Ejemplo con dominio real**:
- Frontend: `https://www.tudominio.com` o `https://tudominio.com`
- Backend: `https://api.tudominio.com`

### Paso 2: Configurar SSL/TLS en Dokploy

1. Ve a tu proyecto en Dokploy
2. En la sección de **Dominios**, agrega tu dominio personalizado
3. Dokploy generará automáticamente certificados SSL con Let's Encrypt
4. Espera 5-10 minutos para que los cambios DNS se propaguen

### Paso 3: Actualizar Variables de Entorno

Después de configurar el dominio, actualiza las variables:

**Backend**:
```bash
CORS_ORIGIN=https://www.tudominio.com,https://tudominio.com,https://chpc-frontend-rrp6aj-18e970-45-88-188-111.traefik.me
FRONTEND_URL=https://www.tudominio.com
```

**Frontend**:
```bash
VUE_APP_API_URL=https://api.tudominio.com/api
```

---

## 🔍 Verificación de Problemas Comunes

### 1. Error CORS
**Síntoma**: `Access-Control-Allow-Origin` error en la consola del navegador

**Solución**:
- ✅ Verificar que `CORS_ORIGIN` use `https://` no `http://`
- ✅ Verificar que el dominio del frontend esté en la lista de `CORS_ORIGIN`
- ✅ Incluir tanto `www.tudominio.com` como `tudominio.com`

### 2. Error de Conexión Rechazada
**Síntoma**: `ERR_CONNECTION_REFUSED` o `Network Error`

**Solución**:
- ✅ Verificar que `VUE_APP_API_URL` tenga el protocolo `https://`
- ✅ Verificar que la URL del backend sea correcta (sin typos)
- ✅ Probar la URL del backend directamente: `https://tu-backend-url/api/health`

### 3. Certificado SSL Inválido
**Síntoma**: Advertencia de certificado en el navegador

**Solución**:
- ✅ Esperar 10-15 minutos después de configurar el dominio
- ✅ Verificar en Dokploy que el certificado SSL se haya generado
- ✅ Verificar que los registros DNS estén correctos en GoDaddy

---

## 🧪 Pruebas de Conectividad

### 1. Probar Backend Directamente
```bash
curl https://chpc-backend-mrdcx4-0db854-45-88-188-111.traefik.me/api/health
```

Debería responder:
```json
{
  "status": "ok",
  "timestamp": "2026-02-11T..."
}
```

### 2. Probar con tu Dominio de GoDaddy (después de configurar)
```bash
curl https://api.tudominio.com/api/health
```

### 3. Verificar CORS
```bash
curl -H "Origin: https://www.tudominio.com" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://api.tudominio.com/api/tienda/productos
```

---

## 📝 Checklist de Despliegue

### Backend
- [ ] Cambiar `http://` a `https://` en `CORS_ORIGIN`
- [ ] Cambiar `http://` a `https://` en `FRONTEND_URL`
- [ ] Agregar dominio de GoDaddy a `CORS_ORIGIN`
- [ ] Generar secretos JWT seguros
- [ ] Verificar `DATABASE_URL` correcta
- [ ] Configurar volumen para `/mnt/multimedia` (ver sección de Volúmenes)
- [ ] Reiniciar aplicación backend en Dokploy

### Frontend
- [ ] Agregar `https://` a `VUE_APP_API_URL`
- [ ] Verificar URL del backend (sin typos)
- [ ] Establecer `VUE_APP_API_PROXY=false`
- [ ] Agregar `NODE_ENV=production`
- [ ] Rebuild y deploy del frontend en Dokploy

### Dominio GoDaddy
- [ ] Agregar registros DNS en GoDaddy
- [ ] Configurar dominio personalizado en Dokploy
- [ ] Esperar propagación DNS (5-30 minutos)
- [ ] Verificar certificado SSL generado
- [ ] Actualizar variables de entorno con dominio personalizado
- [ ] Probar acceso desde dominio personalizado

---

## 💾 Configuración de Volúmenes en Dokploy

### ¿Por qué necesitas un volumen?

El backend almacena imágenes de productos en `/mnt/multimedia/productos`. Sin un volumen, estas imágenes se perderán cada vez que:
- Reconstruyas el contenedor
- Redeployees la aplicación
- Reinicies el servidor

### Paso 1: Crear el Volumen

En Dokploy, ve a tu aplicación backend y busca la sección **"Volumes / Mounts"**:

#### Opción Recomendada: Volume Mount

```
Mount Type: Volume Mount
Host Path: chpc-multimedia
Mount Path (In the container): /mnt/multimedia
```

**Ventajas:**
- ✅ Gestionado automáticamente por Docker
- ✅ Persiste entre redeployees
- ✅ No requiere permisos especiales

#### Opción Alternativa: Bind Mount

Si prefieres tener control directo sobre la carpeta en el servidor:

```
Mount Type: Bind Mount
Host Path: /var/lib/dokploy/volumes/chpc-multimedia
Mount Path (In the container): /mnt/multimedia
```

**Nota**: Debes crear la carpeta en el servidor primero:
```bash
ssh usuario@45.88.188.111
mkdir -p /var/lib/dokploy/volumes/chpc-multimedia
chmod 755 /var/lib/dokploy/volumes/chpc-multimedia
```

### Paso 2: Verificar la Configuración

Después de agregar el volumen:

1. **Reinicia el contenedor** backend en Dokploy
2. **Verifica en los logs** que aparezca:
   ```
   💾 Directorio de imágenes configurado: /mnt/multimedia/productos
   💾 Directorio de imágenes (ImagesService): /mnt/multimedia/productos
   ```
3. **Prueba subir una imagen** de producto desde el frontend
4. **Verifica que persista** después de reiniciar el contenedor

### Estructura de Archivos

Con la configuración correcta, tus archivos se organizarán así:

```
/mnt/multimedia/
  └── productos/
      ├── producto-123-nombre-1707654321.webp
      ├── producto-456-nombre-1707654322.webp
      └── ...
```

### Solución de Problemas

#### ❌ Error: "ENOENT: no such file or directory"

**Causa**: El volumen no está montado correctamente.

**Solución**:
1. Verifica que el volumen esté agregado en Dokploy
2. Reinicia el contenedor backend
3. Verifica los logs de inicio del backend

#### ❌ Error: "EACCES: permission denied"

**Causa**: El usuario del contenedor no tiene permisos de escritura.

**Solución**:
Si usas Bind Mount, ajusta permisos en el servidor:
```bash
ssh usuario@45.88.188.111
chmod -R 755 /var/lib/dokploy/volumes/chpc-multimedia
```

---

## 🆘 Soporte Adicional

### Frontend no Inicia

Si el contenedor del frontend no está corriendo:

1. **Diagnóstico rápido desde el servidor**:
   ```bash
   cd /ruta/al/frontend
   bash diagnostico-frontend.sh
   ```

2. **Diagnóstico desde Windows**:
   ```powershell
   cd frontend
   .\diagnostico-frontend.ps1
   ```

3. **Ver documentación completa**:
   Revisa `frontend/DIAGNOSTICO_DOCKER.md` para soluciones detalladas

### Backend o Base de Datos

Si después de aplicar estos cambios sigues teniendo problemas:

1. **Revisar logs del backend** en Dokploy
2. **Revisar consola del navegador** para errores específicos
3. **Verificar que ambos servicios estén corriendo** en Dokploy
4. **Probar endpoints directamente** con curl/Postman

---

## 📋 Resumen de Cambios Necesarios

| Componente | Variable | Cambio Necesario |
|------------|----------|------------------|
| Backend | CORS_ORIGIN | `http://` → `https://` |
| Backend | FRONTEND_URL | `http://` → `https://` |
| Backend | CORS_ORIGIN | Agregar dominio GoDaddy |
| Frontend | VUE_APP_API_URL | Agregar `https://` al inicio |
| Frontend | VUE_APP_API_URL | Verificar typo "hpc" vs "chpc" |
| GoDaddy | DNS | Agregar registros A/CNAME |
| Dokploy | Dominios | Configurar dominio personalizado |
