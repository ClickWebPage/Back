# 📦 Configuración de Almacenamiento de Imágenes y Videos

## 📋 Resumen

El backend está **completamente configurado** para almacenar imágenes en `/mnt/multimedia`. Solo necesitas configurar el volumen en Easypanel.

---

## ✅ Estado Actual del Código

### 1. Configuración Existente

El código ya implementa:

✅ **Variable de entorno `UPLOAD_DIR`**
- Ubicación: `src/main.ts`, `src/images/images.service.ts`, `src/images/image-optimization.service.ts`
- Valor por defecto: `/mnt/multimedia` (producción) o `public/` (desarrollo)
- Subdirectorio para productos: `/mnt/multimedia/productos`

✅ **Creación automática de directorios**
- Al iniciar la app (en `main.ts`): crea `/mnt/multimedia` y `/mnt/multimedia/productos`
- Al subir imagen (en `image-optimization.service.ts`): verifica/crea directorio antes de guardar

✅ **Servir archivos estáticos**
- URL pública: `https://tu-dominio/uploads/<nombre-archivo>`
- Configurado en `main.ts` con `app.useStaticAssets()`

✅ **Optimización automática de imágenes**
- Convierte todas las imágenes a WebP
- Redimensiona a máximo 1200x1200px (mantiene proporción)
- Compresión con calidad 85%
- Reduce tamaño en promedio ~70%

✅ **Validaciones de seguridad**
- Tipos permitidos: JPG, JPEG, PNG, WebP, GIF
- Tamaño máximo: 10MB
- Nombres de archivo sanitizados
- Nombres únicos con timestamp

---

## 🔧 Configuración en Easypanel

### Paso 1: Variables de Entorno

En Easypanel → **Backend** → **Environment Variables**, agrega:

```env
UPLOAD_DIR=/mnt/multimedia
```

### Paso 2: Crear Volumen (IMPORTANTE)

En Easypanel → **Backend** → **Volumes / Mounts**:

1. Haz clic en **"Add Volume"** o **"Add Mount"**

2. Configura:
   - **Mount Type**: Volume Mount (o Bind Mount si prefieres)
   - **Volume Name / Host Path**: 
     - Si es Volume: `chpc-multimedia` (Easypanel crea el volumen)
     - Si es Bind: `/mnt/multimedia` (usa directorio existente en el VPS)
   - **Container Path**: `/mnt/multimedia`
   - **Read Only**: ❌ NO (debe ser escribible)

3. Guarda y **Redeploy** el backend

### Paso 3: Verificar Permisos (opcional, si tienes SSH)

Si tienes acceso SSH al VPS:

```bash
# Crear directorio si no existe
sudo mkdir -p /mnt/multimedia/productos

# Dar permisos (ajusta UID si es necesario)
sudo chown -R 1000:1000 /mnt/multimedia
sudo chmod -R 755 /mnt/multimedia

# Verificar
ls -la /mnt/multimedia
```

**Nota:** El UID `1000` es el usuario por defecto en contenedores Node. Si el contenedor usa otro usuario, ajusta el UID.

---

## 📊 Arquitectura Actual

```
Backend Container
├── /app/dist/main.js (app NestJS)
├── /mnt/multimedia (montado desde volumen)
│   └── productos/
│       ├── producto-123-imagen-1234567890.webp
│       ├── producto-456-foto-1234567891.webp
│       └── ...
└── node_modules/

Host / VPS
└── /var/lib/docker/volumes/chpc-multimedia/
    └── _data/
        └── productos/
            └── (archivos aquí persisten)
```

### Flujo de Subida de Imagen

```
Usuario Frontend
    ↓
POST /api/images/upload/:productId
    ↓
ImagesController (recibe multipart/form-data)
    ↓
Multer (valida tipo, tamaño) → buffer en memoria
    ↓
ImageOptimizationService
    ├── Sharp: redimensiona + convierte a WebP
    ├── fs.writeFile() → guarda en /mnt/multimedia/productos/
    └── retorna: nombre del archivo
    ↓
ImagesService
    └── Guarda en BD: { producto_id, ruta_imagen, ... }
    ↓
✅ Imagen accesible en: https://tudominio/uploads/productos/archivo.webp
```

---

## 🎯 Endpoints API Disponibles

### Subir Imagen

```http
POST /api/images/upload/:productId
Content-Type: multipart/form-data
Authorization: Bearer <token> (solo admin/vendedor)

Body (form-data):
  - file: <archivo.jpg> (requerido)
  - es_principal: true/false (opcional)
  - orden: 1 (opcional)

Response:
{
  "id": 123,
  "producto_id": 456,
  "ruta_imagen": "/uploads/productos/producto-456-imagen-1234567890.webp",
  "nombre_archivo": "imagen.webp",
  "tipo_archivo": "image/webp",
  "tamano_archivo": 245678,
  "es_principal": true,
  "orden": 1,
  "created_at": "2026-02-13T10:30:00.000Z"
}
```

### Obtener Imágenes de un Producto

```http
GET /api/images/producto/:productId
Authorization: Bearer <token>

Response:
[
  {
    "id": 123,
    "ruta_imagen": "/uploads/productos/producto-456-imagen-1234567890.webp",
    "es_principal": true,
    "orden": 1
  },
  ...
]
```

### Eliminar Imagen

```http
DELETE /api/images/:id
Authorization: Bearer <token> (solo admin/vendedor)

Response:
{
  "id": 123,
  "deleted": true
}
```

**Nota:** Al eliminar, se borra el registro en BD Y el archivo físico.

### Acceder a Imagen Públicamente

```http
GET /uploads/productos/producto-456-imagen-1234567890.webp

Response: imagen WebP (navegador la renderiza)
```

---

## 🎬 Videos (Futuro)

Actualmente **NO** hay soporte para videos. Para agregarlo:

### Opción 1: Almacenamiento Local (extensión del actual)

1. Actualizar `MulterModule` para aceptar videos:
   ```typescript
   fileFilter: (req, file, callback) => {
     const allowedMimes = [
       'image/jpeg', 'image/png', ...,
       'video/mp4', 'video/webm', 'video/quicktime'
     ];
     // ...
   }
   ```

2. Crear subdirectorio `/mnt/multimedia/videos`

3. Subir sin optimización (o comprimir con `ffmpeg` si lo instalas)

4. Servir igual que imágenes

**Limitaciones:**
- Videos grandes pueden saturar disco
- Streaming básico (no optimizado para múltiples usuarios)
- Sin transcoding automático

### Opción 2: Servicio Externo (Recomendado)

- **Vimeo / YouTube**: Subir ahí, guardar solo URL en BD
- **AWS S3 + CloudFront**: Almacenamiento escalable + CDN
- **DigitalOcean Spaces**: Similar a S3, más económico
- **Bunny CDN**: Especializado en videos, económico

Ventajas:
- No usa espacio del VPS
- Transcoding automático (múltiples calidades)
- Streaming optimizado (HLS/DASH)
- CDN global (baja latencia)

---

## 📝 Checklist de Configuración

- [x] Código backend configurado para usar `UPLOAD_DIR`
- [x] Directorio creado automáticamente al iniciar
- [x] Archivos estáticos servidos en `/uploads/`
- [x] Optimización automática de imágenes
- [x] Validaciones de seguridad implementadas
- [ ] **Variable `UPLOAD_DIR` en Easypanel** (hacer)
- [ ] **Volumen montado en Easypanel** (hacer)
- [ ] **Redeploy backend** (después de configurar)
- [ ] **Probar subida de imagen** (testing)
- [ ] **Verificar acceso público** (https://tudominio/uploads/...)

---

## 🧪 Prueba de Funcionamiento

### Desde el Frontend

1. Ir al panel de administración
2. Seleccionar un producto
3. Subir una imagen
4. Verificar que aparece en el listado
5. Abrir la URL de la imagen en el navegador

### Desde Postman/API

```bash
# Subir imagen
curl -X POST https://chpc-web-backend.qut3sg.easypanel.host/api/images/upload/123 \
  -H "Authorization: Bearer <tu-token>" \
  -F "file=@/ruta/a/imagen.jpg" \
  -F "es_principal=true"

# Ver imagen
curl https://chpc-web-backend.qut3sg.easypanel.host/uploads/productos/producto-123-imagen-1234567890.webp
```

### Verificar en el Servidor (SSH)

```bash
# Ver archivos subidos
ls -lh /mnt/multimedia/productos/

# Ver últimos 5 archivos
ls -lt /mnt/multimedia/productos/ | head -6

# Ver tamaño total usado
du -sh /mnt/multimedia/productos/
```

---

## 🔒 Seguridad

### Implementado

✅ Validación de tipo MIME
✅ Validación de tamaño (10MB máximo)
✅ Nombres de archivo sanitizados (evita path traversal)
✅ Nombres únicos con timestamp (evita colisiones)
✅ Autenticación JWT requerida
✅ Roles: solo admin/vendedor pueden subir

### Recomendaciones Adicionales

- [ ] **Rate limiting**: Limitar subidas por usuario (evitar abuse)
- [ ] **Virus scan**: Integrar ClamAV para escanear archivos (opcional)
- [ ] **Watermark**: Agregar marca de agua a imágenes (opcional)
- [ ] **CDN**: Usar Cloudflare/Bunny para servir archivos (producción)
- [ ] **Backups**: Backup automático del volumen (crítico)

---

## 📊 Monitoreo y Mantenimiento

### Verificar Espacio en Disco

```bash
# En el host
df -h /mnt/multimedia

# Dentro del contenedor
docker exec <container-id> df -h /mnt/multimedia
```

### Limpiar Imágenes Huérfanas

Si eliminas productos pero las imágenes quedan:

```bash
# Script de limpieza (futuro)
# Buscar archivos sin registro en BD
# Eliminar después de X días
```

### Logs

```bash
# Ver logs del backend (subidas, errores)
docker logs -f <backend-container-id>

# Filtrar logs de imágenes
docker logs <backend-container-id> 2>&1 | grep "OPTIMIZACIÓN"
```

---

## 🆘 Troubleshooting

### Error: "EACCES: permission denied"

**Causa:** El proceso en el contenedor no tiene permisos para escribir en `/mnt/multimedia`

**Solución:**
```bash
# En el host/VPS (con SSH)
sudo chown -R 1000:1000 /mnt/multimedia
sudo chmod -R 755 /mnt/multimedia
```

O en el `Dockerfile`:
```dockerfile
RUN mkdir -p /mnt/multimedia/productos && \
    chown -R node:node /mnt/multimedia
USER node
```

### Error: "No such file or directory"

**Causa:** El volumen no está montado correctamente

**Solución:**
1. Verifica en Easypanel → Volumes que el mount existe
2. Verifica que Container Path sea exactamente `/mnt/multimedia`
3. Redeploy el backend

### Imágenes no aparecen (404)

**Causa 1:** Ruta incorrecta en BD

**Solución:** Verifica que `ruta_imagen` en BD sea `/uploads/productos/archivo.webp` (con `/uploads/`prefix)

**Causa 2:** Archivos no están en el directorio

**Solución:**
```bash
# Verificar archivos
docker exec <container-id> ls -la /mnt/multimedia/productos/
```

### Imágenes desaparecen después de redeploy

**Causa:** El volumen no está montado (archivos dentro del contenedor se pierden)

**Solución:** Configurar volumen en Easypanel (ver Paso 2 arriba)

---

## 💡 Optimizaciones Futuras

### Corto Plazo
- [ ] Agregar endpoint para listar todas las imágenes
- [ ] Implementar paginación en listados
- [ ] Agregar filtros (por producto, fecha, tamaño)
- [ ] Endpoint para reordenar imágenes (array de IDs)

### Mediano Plazo
- [ ] Generación de thumbnails (múltiples tamaños)
- [ ] Soporte para videos (con transcoding básico)
- [ ] Agregar watermark configurable
- [ ] Bulk upload (subir múltiples imágenes a la vez)

### Largo Plazo (Escalabilidad)
- [ ] Migrar a S3/Spaces (storage externo)
- [ ] Integrar CDN (Cloudflare, Bunny)
- [ ] Sistema de caché avanzado
- [ ] Procesamiento asíncrono (queue con Bull/BullMQ)
- [ ] Analytics de imágenes más vistas

---

## 📚 Referencias

- [Sharp (procesamiento de imágenes)](https://sharp.pixelplumbing.com/)
- [Multer (uploads)](https://github.com/expressjs/multer)
- [NestJS Static Assets](https://docs.nestjs.com/techniques/mvc#static-assets)
- [Docker Volumes](https://docs.docker.com/storage/volumes/)
- [WebP Format](https://developers.google.com/speed/webp)

---

## ✅ Conclusión

**El código está listo.** Solo necesitas:

1. Agregar `UPLOAD_DIR=/mnt/multimedia` en variables de entorno (Easypanel)
2. Montar volumen en `/mnt/multimedia` (Easypanel)
3. Redeploy el backend
4. ¡Probar subiendo una imagen!

Las imágenes se guardarán en `/mnt/multimedia/productos/` y persistirán entre deploys.
