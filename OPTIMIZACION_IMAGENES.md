# Optimización de Imágenes con Sharp

Este módulo utiliza **Sharp** para optimizar automáticamente las imágenes subidas, convirtiéndolas al formato **WebP** con compresión optimizada.

## 🎯 Beneficios

- **Reducción de tamaño**: Las imágenes WebP son 25-35% más pequeñas que JPG/PNG
- **Mejor rendimiento**: Páginas más rápidas y menor uso de ancho de banda
- **Calidad preservada**: Compresión inteligente mantiene calidad visual
- **Dimensiones controladas**: Las imágenes grandes se redimensionan automáticamente

## 📡 Endpoints Disponibles

### 1. Upload Estándar con Optimización (Recomendado)
```
POST /images/upload/:productId
```

**Características:**
- Convierte automáticamente JPG/PNG a WebP
- Redimensiona a máximo 1200x1200px (mantiene proporción)
- Calidad optimizada al 85%
- Reduce tamaño típicamente en 30-60%

**Ejemplo con Axios:**
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('es_principal', 'true');
formData.append('orden', '0');

await axios.post(`${API_BASE_URL}/images/upload/${productId}`, formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
    'Authorization': `Bearer ${token}`
  }
});
```

### 2. Upload con Optimización Personalizada
```
POST /images/upload-optimized/:productId
```

**Parámetros adicionales:**
- `maxWidth`: Ancho máximo (default: 1200)
- `maxHeight`: Alto máximo (default: 1200)
- `quality`: Calidad 0-100 (default: 85)

**Ejemplo:**
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('es_principal', 'true');
formData.append('maxWidth', '800');
formData.append('maxHeight', '800');
formData.append('quality', '90');

await axios.post(`${API_BASE_URL}/images/upload-optimized/${productId}`, formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
    'Authorization': `Bearer ${token}`
  }
});
```

## 🔧 Configuración del Servicio

El servicio `ImageOptimizationService` está disponible para inyectar en otros módulos:

```typescript
import { ImageOptimizationService } from './images/image-optimization.service';

@Injectable()
export class MiServicio {
  constructor(
    private readonly imageOptService: ImageOptimizationService
  ) {}

  async procesarImagen(file: Express.Multer.File, productId: number) {
    // Método básico
    const ruta = await this.imageOptService.convertToWebp(file, productId);
    
    // Método personalizado
    const rutaCustom = await this.imageOptService.convertToWebpCustom(
      file, 
      productId, 
      1600, // maxWidth
      1600, // maxHeight
      90    // quality
    );
    
    // Crear múltiples versiones
    const versiones = await this.imageOptService.createMultipleVersions(
      file, 
      productId
    );
    // Retorna: { thumbnail, medium, large }
  }
}
```

## 📊 Niveles de Calidad Recomendados

| Uso | Calidad | Tamaño Aproximado |
|-----|---------|-------------------|
| Thumbnails/Miniaturas | 70-75 | ~10-20 KB |
| Imágenes de producto | 85-90 | ~50-150 KB |
| Imágenes de alta calidad | 90-95 | ~150-300 KB |
| Máxima calidad | 95-100 | ~300-500 KB |

## 🎨 Formatos Soportados

**Entrada:** JPG, JPEG, PNG, WebP
**Salida:** WebP (optimizado)

## 💾 Dimensiones Recomendadas

- **Productos estándar**: 1200x1200px (default)
- **Banners**: 1600x600px
- **Thumbnails**: 300x300px
- **Galerías**: 800x800px

## ⚡ Rendimiento

Ejemplo de optimización típica:
```
Archivo original: producto.jpg
- Tamaño: 2.8 MB (2800x2100px)
- Formato: JPEG

Después de optimización:
- Tamaño: 280 KB (1200x900px)
- Formato: WebP
- Reducción: 90%
```

## 🔍 Logs y Debug

El servicio proporciona logs detallados en consola:
```
=== OPTIMIZACIÓN DE IMAGEN ===
Archivo original: producto-ejemplo.jpg
Tipo MIME: image/jpeg
Tamaño original: 2.8 MB
Imagen optimizada:
  - Tamaño final: 280 KB
  - Reducción: 90.00%
  - Archivo guardado: producto-123-ejemplo-1234567890.webp
=================================
```

## 🛠️ Troubleshooting

### Error: "Cannot find module 'sharp'"
```bash
npm install sharp --force
```

### Error: "Sharp installation failed"
En Windows, puede requerir build tools:
```bash
npm install --global windows-build-tools
npm install sharp
```

### Verificar instalación:
```bash
node test-sharp.js
```

## 📝 Notas Importantes

1. **Compatibilidad con navegadores**: WebP es soportado por todos los navegadores modernos (Chrome, Firefox, Edge, Safari 14+)

2. **Fallback para navegadores antiguos**: Considerar servir JPG para Safari < 14

3. **Tamaño máximo**: 
   - Endpoint estándar: 5 MB
   - Endpoint optimizado: 10 MB

4. **Almacenamiento**: Las imágenes se guardan en `public/Productos/`

5. **Nombres de archivo**: Se generan automáticamente con formato:
   ```
   producto-{productId}-{nombreOriginal}-{timestamp}.webp
   ```

## 🚀 Mejoras Futuras

- [ ] Soporte para múltiples versiones automáticas (thumb, medium, large)
- [ ] Detección automática de formato óptimo (WebP vs AVIF)
- [ ] Lazy loading y progressive loading
- [ ] CDN integration
- [ ] Batch processing para optimizar imágenes existentes
