# Módulo de Gestión de Productos e Imágenes - Panel Administrativo

## Resumen de Cambios

Se ha implementado un módulo completo para gestionar productos e imágenes desde el panel administrativo.

## Backend

### 1. Módulo de Imágenes (`/backend/src/images`)

**Archivos creados:**
- `images.module.ts` - Módulo principal
- `images.controller.ts` - Controlador con endpoints para gestionar imágenes
- `images.service.ts` - Lógica de negocio para imágenes
- `dto/create-image.dto.ts` - DTO para crear imágenes
- `dto/update-image.dto.ts` - DTO para actualizar imágenes

**Endpoints disponibles:**
- `GET /api/images/producto/:productId` - Obtener todas las imágenes de un producto
- `GET /api/images/:id` - Obtener una imagen por ID
- `POST /api/images/upload/:productId` - Subir nueva imagen (requiere rol admin/vendedor)
- `PUT /api/images/:id` - Actualizar datos de imagen
- `DELETE /api/images/:id` - Eliminar imagen
- `PUT /api/images/:id/principal` - Marcar imagen como principal
- `PUT /api/images/producto/:productId/reorder` - Reordenar imágenes

### 2. Actualización del Módulo de Productos

**Archivos modificados:**
- `products.controller.ts` - Agregados endpoints PUT y DELETE
- `products.service.ts` - Agregados métodos update() y remove()
- `dto/update-product.dto.ts` - DTO para actualizar productos

**Nuevos endpoints:**
- `PUT /api/tienda/productos/:id` - Actualizar producto (admin/vendedor)
- `DELETE /api/tienda/productos/:id` - Desactivar producto (admin)

**Nota:** El endpoint DELETE hace un "soft delete" marcando el producto como inactivo en lugar de eliminarlo físicamente.

### 3. Registro en AppModule

- Módulo ImagesModule agregado a `app.module.ts`
- Dependencias instaladas: `@nestjs/platform-express`, `multer`, `@types/multer`

## Frontend

### 1. Componente AdminProductos

**Archivos creados:**
- `AdminProductos.vue` - Template del componente
- `AdminProductos.js` - Lógica del componente
- `AdminProductos.css` - Estilos del componente

**Funcionalidades:**
1. **Listado de Productos**
   - Grid visual con cards de productos
   - Muestra imagen, nombre, categoría, precio y stock
   - Indicador visual para productos inactivos

2. **Crear/Editar Productos**
   - Modal con formulario completo
   - Campos: nombre, SKU, descripción, precio, stock, marca, color, categoría, subcategoría, modelo, garantía, especificaciones
   - Checkboxes para "destacado" y "activo"
   - Validaciones en frontend

3. **Gestión de Imágenes**
   - Modal separado para administrar imágenes
   - Subir múltiples imágenes por producto (hasta 4)
   - Previsualización de imágenes
   - Marcar imagen principal
   - Eliminar imágenes
   - Galería visual con overlays

4. **Activar/Desactivar Productos**
   - Botón para toggle de estado activo/inactivo
   - Confirmación antes de cambiar estado

### 2. Integración con AdminPanel

**Archivo modificado:**
- `AdminPanel.vue` - Agregado tab "Productos" como primera opción

## Estructura de Base de Datos

La tabla `ProductImage` ya existía en el schema de Prisma:

```prisma
model ProductImage {
  id                 Int      @id @default(autoincrement())
  producto_id        Int
  ruta_imagen        String   @db.VarChar(500)
  nombre_archivo     String?  @db.VarChar(255)
  tipo_archivo       String?  @db.VarChar(50)
  tamano_archivo     Int?
  es_principal       Boolean  @default(false)
  orden              Int      @default(0)
  version_optimizada Boolean  @default(false)
  fecha_subida       DateTime @default(now())
  
  producto           Product  @relation(fields: [producto_id], references: [id], onDelete: Cascade)
}
```

## Almacenamiento de Archivos

- **Directorio:** `/frontend-chpc/public/Productos/`
- **Formato de nombres:** `producto-{id}-{timestamp}.{ext}`
- **Tipos permitidos:** JPG, PNG, WEBP
- **Tamaño máximo:** 5MB por imagen
- **Validaciones:** En backend y frontend

## Uso del Sistema

### Para Administradores/Vendedores:

1. **Acceder al Panel Admin:**
   - Ir a `/dashboard` (requiere login como admin o vendedor)
   - Click en tab "Productos"

2. **Crear Nuevo Producto:**
   - Click en "+ Nuevo Producto"
   - Llenar formulario con todos los datos
   - Click en "Guardar Producto"

3. **Editar Producto:**
   - Click en ícono de lápiz (✏️) en el card del producto
   - Modificar campos necesarios
   - Click en "Guardar Producto"

4. **Gestionar Imágenes:**
   - Click en ícono de imagen (🖼️) en el card del producto
   - Click en "Seleccionar Imagen" para subir nueva
   - Marcar checkbox "imagen principal" si es necesaria
   - Click en "Subir Imagen"
   - Para eliminar: hover sobre imagen y click en 🗑️
   - Para marcar como principal: hover y click en ⭐

5. **Activar/Desactivar Producto:**
   - Click en botón 🚫 (para desactivar) o ✅ (para activar)
   - Confirmar acción

## Seguridad

- Todos los endpoints de modificación requieren autenticación JWT
- Roles verificados: `administrador` y `vendedor`
- Endpoint DELETE solo para administradores
- Validación de tipos de archivo en backend
- Validación de tamaño de archivo (5MB max)
- Soft delete para productos (no se eliminan físicamente)
- OnDelete Cascade para imágenes (se eliminan automáticamente si se elimina producto)

## Flujo de Trabajo Recomendado

1. Crear producto con datos básicos
2. Guardar producto
3. Click en "Gestionar Imágenes"
4. Subir 1-4 imágenes del producto
5. Marcar una como principal
6. Producto estará visible en la tienda con galería de imágenes

## Próximos Pasos Sugeridos

1. Actualizar componentes de frontend para mostrar galería de imágenes en:
   - ProductoDetalle.vue
   - HomePage.vue
   - ProductosPorCategoria.vue
   - TodosLosProductos.vue

2. Implementar zoom en imágenes del detalle del producto

3. Agregar paginación en listado de productos del admin

4. Implementar búsqueda/filtros en panel admin

5. Agregar optimización automática de imágenes (resize, compression)

## Notas Técnicas

- El sistema usa Multer para manejar multipart/form-data
- Las imágenes se almacenan en el directorio public del frontend
- Las rutas de imágenes se guardan relativas: `/Productos/nombre.jpg`
- El componente AdminProductos es autónomo y puede reutilizarse
- Se respeta la configuración de red local para API_BASE_URL

## Dependencias Instaladas

**Backend:**
- `@nestjs/platform-express@^10.0.0`
- `multer@^1.4.5-lts.1`
- `@types/multer@^1.4.12`
