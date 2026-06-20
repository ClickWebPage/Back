# 📢 Módulo de Promociones

## ✅ Estado Actual

El módulo de promociones está **completamente configurado y funcional** con el nuevo esquema de Prisma.

## 🗄️ Modelo de Base de Datos

```prisma
model Promotion {
  id                   Int      @id @default(autoincrement())
  producto_id          Int
  porcentaje_descuento Float
  fecha_inicio         DateTime
  fecha_fin            DateTime
  activa               Boolean  @default(true)
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt
  
  producto             Product  @relation(fields: [producto_id], references: [codigo], onDelete: Cascade)
  
  @@map("promociones")
  @@index([producto_id])
  @@index([activa])
  @@index([fecha_inicio, fecha_fin])
}
```

## 🔌 Endpoints Disponibles

### Base URL
```
/api/promociones
```

### 1. Crear Promoción
**POST** `/api/promociones`
- **Autenticación**: ✅ Requerida (JWT)
- **Rol**: Admin
- **Body**:
```json
{
  "producto_id": 123,
  "porcentaje_descuento": 15.5,
  "fecha_inicio": "2026-02-20T00:00:00Z",
  "fecha_fin": "2026-03-20T23:59:59Z",
  "activa": true
}
```

### 2. Obtener Todas las Promociones
**GET** `/api/promociones`
- **Autenticación**: ❌ No requerida
- **Respuesta**: Array de promociones con información del producto incluida

### 3. Obtener Promociones Activas
**GET** `/api/promociones/activas`
- **Autenticación**: ❌ No requerida
- **Descripción**: Retorna solo las promociones activas en el momento actual

### 4. Obtener Promoción de un Producto
**GET** `/api/promociones/producto/:id`
- **Autenticación**: ❌ No requerida
- **Parámetro**: ID del producto (código)
- **Descripción**: Retorna la promoción activa de un producto específico

### 5. Obtener Promoción por ID
**GET** `/api/promociones/:id`
- **Autenticación**: ❌ No requerida
- **Parámetro**: ID de la promoción

### 6. Actualizar Promoción
**PATCH** `/api/promociones/:id`
- **Autenticación**: ✅ Requerida (JWT)
- **Rol**: Admin
- **Body**: Campos a actualizar (parcial)

### 7. Eliminar Promoción
**DELETE** `/api/promociones/:id`
- **Autenticación**: ✅ Requerida (JWT)
- **Rol**: Admin

### 8. Desactivar Promociones Vencidas
**POST** `/api/promociones/desactivar-vencidas`
- **Autenticación**: ✅ Requerida (JWT)
- **Rol**: Admin
- **Descripción**: Desactiva automáticamente todas las promociones que ya expiraron

## 🔒 Validaciones Implementadas

1. ✅ El producto debe existir en la base de datos
2. ✅ La fecha de inicio debe ser anterior a la fecha de fin
3. ✅ No puede haber múltiples promociones activas para el mismo producto en el mismo período
4. ✅ El porcentaje de descuento debe estar entre 0 y 100

## 📋 Ejemplos de Uso

### Crear una promoción con curl
```bash
curl -X POST http://localhost:5000/api/promociones \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "producto_id": 123,
    "porcentaje_descuento": 20,
    "fecha_inicio": "2026-02-20T00:00:00Z",
    "fecha_fin": "2026-03-20T23:59:59Z"
  }'
```

### Obtener promociones activas
```bash
curl http://localhost:5000/api/promociones/activas
```

### Ver promoción de un producto
```bash
curl http://localhost:5000/api/promociones/producto/123
```

## 📊 Datos Incluidos en las Respuestas

Cuando se consultan promociones, se incluye información del producto:
- `codigo`: Código del producto
- `producto`: Nombre del producto
- `costoTotal`: Precio del producto
- `marca`: Marca del producto
- `productImages`: Imágenes del producto (con orden y principal)

## 🎨 Frontend - Pendiente

Actualmente **NO existe** un componente de administración de promociones en el frontend. 

### Para implementarlo se necesitaría:
1. Crear `AdminPromociones.vue` en `frontend/src/components/AdminPanel/`
2. Agregar ruta en el router
3. Crear formularios para:
   - Listar promociones existentes
   - Crear nueva promoción
   - Editar promoción
   - Eliminar promoción
   - Ver promociones activas

## 🚀 Integración con Productos

Para mostrar promociones en las páginas de productos:

```javascript
// En ProductoDetalle.js o TodosLosProductos.js
import apiClient from '@/services/api';

// Obtener promoción del producto
async obtenerPromocion(productoCodigo) {
  try {
    const response = await apiClient.get(`/promociones/producto/${productoCodigo}`);
    return response.data; // { porcentaje_descuento, fecha_inicio, fecha_fin, activa }
  } catch (error) {
    return null; // No tiene promoción activa
  }
}

// Calcular precio con descuento
calcularPrecioConDescuento(precioOriginal, porcentajeDescuento) {
  return precioOriginal * (1 - porcentajeDescuento / 100);
}
```

## ✨ Mejoras Futuras Sugeridas

1. **Tarea programada (Cron)**: Desactivar automáticamente promociones vencidas cada noche
2. **Notificaciones**: Alertar cuando una promoción está por vencer
3. **Categorías**: Permitir promociones por categoría o marca, no solo por producto
4. **Códigos de descuento**: Agregar cupones o códigos promocionales
5. **Analytics**: Tracking de conversiones por promoción

## 📝 Notas Importantes

- ✅ El módulo está importado en `app.module.ts`
- ✅ Usa el nuevo esquema de Prisma correctamente
- ✅ Todas las relaciones funcionan correctamente
- ✅ Los endpoints están protegidos con JWT y Roles
- ⚠️ No hay interfaz de administración en el frontend (TODO)
