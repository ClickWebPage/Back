# 🌐 Guía: Configurar Dominio de GoDaddy con Dokploy

Esta guía te ayudará a conectar tu dominio de GoDaddy con tu aplicación desplegada en Dokploy.

---

## 📋 Requisitos Previos

- ✅ Dominio registrado en GoDaddy
- ✅ Aplicaciones desplegadas en Dokploy (frontend y backend)
- ✅ Acceso al panel de Dokploy
- ✅ Direcciones de los servicios en Traefik (las tienes: `chpc-frontend-rrp6aj...` y `chpc-backend-mrdcx4...`)

---

## 🎯 Objetivo Final

Queremos que:
- **Frontend**: `https://www.tudominio.com` o `https://tudominio.com`
- **Backend API**: `https://api.tudominio.com`

---

## 📝 Paso 1: Identificar la IP de tu Servidor Dokploy

Según tus URLs de Traefik, tu servidor está en:
```
45.88.188.111
```

Esta es la IP que usaremos para configurar los registros DNS.

---

## 🔧 Paso 2: Configurar DNS en GoDaddy

### 2.1 Acceder a la Configuración DNS

1. Inicia sesión en [GoDaddy](https://www.godaddy.com)
2. Ve a **"Mis Productos"**
3. Encuentra tu dominio y haz clic en **"DNS"** o **"Administrar DNS"**

### 2.2 Agregar/Modificar Registros DNS

Necesitas crear estos 3 registros:

#### 📌 Registro 1: Dominio Principal (Root)
```
Tipo:       A
Nombre:     @
Valor:      45.88.188.111
TTL:        600 segundos (o el mínimo disponible)
```
- **Qué hace**: Apunta `tudominio.com` a tu servidor

#### 📌 Registro 2: WWW (Frontend)
```
Tipo:       A
Nombre:     www
Valor:      45.88.188.111
TTL:        600 segundos
```
- **Qué hace**: Apunta `www.tudominio.com` a tu servidor

#### 📌 Registro 3: API (Backend)
```
Tipo:       A
Nombre:     api
Valor:      45.88.188.111
TTL:        600 segundos
```
- **Qué hace**: Apunta `api.tudominio.com` a tu backend

### 2.3 Guardar Cambios

- Haz clic en **"Guardar"** o **"Guardar cambios"**
- Los cambios pueden tardar entre **5 minutos y 48 horas** en propagarse (generalmente 15-30 minutos)

### 2.4 Verificar Registros DNS

Espera unos minutos y verifica con este comando en PowerShell:

```powershell
# Verificar dominio principal
nslookup tudominio.com

# Verificar www
nslookup www.tudominio.com

# Verificar api
nslookup api.tudominio.com
```

Deberían responder con la IP: `45.88.188.111`

---

## 🚀 Paso 3: Configurar Dominios en Dokploy

### 3.1 Configurar Frontend

1. Accede a tu panel de Dokploy
2. Ve al proyecto del **Frontend** (`chpc-frontend-rrp6aj...`)
3. Busca la sección **"Dominios"** o **"Custom Domains"**
4. Agrega estos dos dominios:
   ```
   tudominio.com
   www.tudominio.com
   ```
5. Dokploy generará automáticamente certificados SSL (Let's Encrypt)
6. Guarda los cambios

### 3.2 Configurar Backend

1. Ve al proyecto del **Backend** (`chpc-backend-mrdcx4...`)
2. En la sección **"Dominios"**
3. Agrega:
   ```
   api.tudominio.com
   ```
4. Guarda los cambios

### 3.3 Esperar Generación de Certificados SSL

- Dokploy generará certificados SSL automáticamente
- Esto puede tardar **5-10 minutos**
- Verás un indicador de estado (🟢 cuando esté listo)

---

## 🔐 Paso 4: Actualizar Variables de Entorno

### 4.1 Backend - Actualizar CORS

En las variables de entorno del **backend** en Dokploy:

```bash
CORS_ORIGIN=https://www.tudominio.com,https://tudominio.com,https://chpc-frontend-rrp6aj-18e970-45-88-188-111.traefik.me
FRONTEND_URL=https://www.tudominio.com
```

### 4.2 Frontend - Actualizar URL del Backend

En las variables de entorno del **frontend** en Dokploy:

```bash
VUE_APP_API_URL=https://api.tudominio.com/api
VUE_APP_API_PROXY=false
NODE_ENV=production
```

### 4.3 Reiniciar Servicios

1. Después de cambiar las variables, **reinicia** o **redeploy** ambas aplicaciones en Dokploy
2. Espera a que ambas aplicaciones estén corriendo

---

## ✅ Paso 5: Verificar que Todo Funcione

### 5.1 Verificar Backend

Abre en tu navegador o usa curl:
```bash
curl https://api.tudominio.com/api/health
```

Debería responder:
```json
{
  "status": "ok",
  "timestamp": "2026-02-11T..."
}
```

### 5.2 Verificar Frontend

Abre en tu navegador:
```
https://www.tudominio.com
```

Deberías ver tu aplicación cargada correctamente.

### 5.3 Verificar SSL

- El navegador debe mostrar el **candado verde** 🔒
- El certificado debe ser válido (emitido por Let's Encrypt)
- No debe haber advertencias de seguridad

### 5.4 Verificar Conectividad Frontend-Backend

1. Abre tu frontend: `https://www.tudominio.com`
2. Abre la consola del navegador (F12)
3. Navega a una página que cargue datos del backend
4. **NO** deberían aparecer errores CORS ni errores de red

---

## 🐛 Solución de Problemas Comunes

### ❌ Error: "DNS_PROBE_FINISHED_NXDOMAIN"

**Causa**: Los registros DNS aún no se han propagado.

**Solución**:
- Espera 15-30 minutos más
- Verifica que los registros DNS estén correctos en GoDaddy
- Usa `nslookup tudominio.com` para verificar

### ❌ Error: "ERR_SSL_VERSION_OR_CIPHER_MISMATCH"

**Causa**: El certificado SSL aún no se ha generado.

**Solución**:
- Espera 10-15 minutos
- Verifica en Dokploy que el dominio esté correctamente agregado
- Intenta eliminar y volver a agregar el dominio en Dokploy

### ❌ Error: "Access-Control-Allow-Origin"

**Causa**: CORS no está configurado correctamente.

**Solución**:
- Verifica que `CORS_ORIGIN` en el backend incluya tu dominio
- Asegúrate de usar `https://` NO `http://`
- Incluye tanto `www.tudominio.com` como `tudominio.com`
- Reinicia el backend después de cambiar variables

### ❌ Error: "ERR_CONNECTION_REFUSED"

**Causa**: La URL del backend es incorrecta.

**Solución**:
- Verifica `VUE_APP_API_URL` en el frontend
- Debe ser: `https://api.tudominio.com/api`
- Debe incluir el protocolo `https://`
- Verifica que el backend esté corriendo en Dokploy

### ❌ La página carga pero no hay datos

**Causa**: El frontend no puede conectarse al backend.

**Solución**:
1. Abre la consola del navegador (F12)
2. Ve a la pestaña "Network" (Red)
3. Recarga la página
4. Busca llamadas a la API que fallen
5. Haz clic en la llamada fallida para ver el error exacto

---

## 📊 Resumen de URLs Finales

Después de completar esta guía, tendrás:

| Servicio | URL Temporal (Traefik) | URL Final (GoDaddy) |
|----------|------------------------|---------------------|
| Frontend | `chpc-frontend-rrp6aj-18e970-45-88-188-111.traefik.me` | `https://www.tudominio.com` |
| Backend | `chpc-backend-mrdcx4-0db854-45-88-188-111.traefik.me` | `https://api.tudominio.com` |

**Las URLs temporales seguirán funcionando** por si necesitas volver a ellas.

---

## 🔄 Mantenimiento y Redirecciones (Opcional)

### Redirigir tudominio.com a www.tudominio.com

Si prefieres que todos usen `www.tudominio.com`, puedes configurar una redirección en Dokploy o modificar los registros DNS.

En GoDaddy, modifica el registro `@`:
```
Tipo:       CNAME
Nombre:     @
Valor:      www.tudominio.com
TTL:        600
```

O usa ambas URLs (recomendado para SEO).

---

## 📞 ¿Necesitas Ayuda?

Si después de seguir estos pasos aún tienes problemas:

1. **Verifica los logs** en Dokploy
2. **Revisa la consola del navegador** (F12)
3. **Prueba las URLs directamente** con curl
4. **Comparte los errores exactos** que ves

---

## ✨ ¡Listo!

Una vez completados estos pasos, tu aplicación estará accesible desde tu dominio personalizado de GoDaddy con certificados SSL válidos.

**Tiempo estimado total**: 30-60 minutos (incluyendo propagación DNS)
