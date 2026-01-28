# 🚀 Guía de Configuración de Base de Datos - Productos

Esta guía te ayudará a configurar la base de datos con productos de prueba sin depender del ERP.

## 📋 Cambios Realizados

### 1. Schema de Prisma Actualizado
Se han agregado los siguientes campos al modelo `Product`:
- `categoria`: Categoría del producto (Laptops, Componentes, Periféricos, etc.)
- `subcategoria`: Subcategoría más específica
- `modelo`: Modelo del producto
- `sku`: Código único de producto
- `especificaciones`: Especificaciones técnicas detalladas
- `garantia`: Información de garantía
- `activo`: Si el producto está activo (visible)
- `destacado`: Si es un producto destacado
- `fecha_creacion` y `fecha_actualizacion`: Timestamps automáticos

### 2. Datos de Prueba
El archivo `seed-products.js` contiene **28 productos** distribuidos en 6 categorías:
- 📱 **Laptops**: 4 productos
- 🔧 **Componentes**: 4 productos (CPU, GPU, RAM, etc.)
- ⌨️ **Periféricos**: 4 productos (teclados, mouse, headsets, webcam)
- 💾 **Almacenamiento**: 4 productos (SSD, HDD, externos)
- 🌐 **Redes**: 4 productos (routers, switches, AP, adaptadores)
- 🎧 **Audio**: 4 productos (bocinas, audífonos, micrófonos)

## 🛠️ Pasos para Configurar

### Opción 1: Script Automático (Recomendado)

Desde la carpeta `backend`, ejecuta:

```powershell
.\setup-database.ps1
```

Este script hará automáticamente:
1. Generar el cliente de Prisma
2. Crear y aplicar la migración
3. Poblar la base de datos con productos
4. Abrir Prisma Studio para verificar

### Opción 2: Paso a Paso Manual

1. **Generar el cliente de Prisma**
```bash
npx prisma generate
```

2. **Crear y aplicar la migración**
```bash
npx prisma migrate dev --name "add_product_fields_for_testing"
```

3. **Poblar la base de datos**
```bash
node seed-products.js
```

4. **Verificar los datos (opcional)**
```bash
npx prisma studio
```

## 🔍 Verificación

Después de ejecutar el setup, puedes verificar que todo funcionó:

1. **Prisma Studio**: Abre http://localhost:5555 y verás todos los productos
2. **Backend API**: Inicia el servidor con `npm run start:dev` y prueba:
   - `GET http://localhost:5000/tienda/productos` - Todos los productos
   - `GET http://localhost:5000/tienda/productos?categoria=Laptops` - Filtrar por categoría
   - `GET http://localhost:5000/tienda/productos?destacado=true` - Solo destacados

## 📊 Endpoints Actualizados del Backend

### Filtros disponibles:
- `?minPrice=100&maxPrice=500` - Rango de precio
- `?priceRange=low|mid|high` - Rango predefinido
- `?marca=Dell` - Por marca
- `?categoria=Laptops` - Por categoría
- `?subcategoria=Laptops Personales` - Por subcategoría
- `?destacado=true` - Solo destacados
- `?search=gaming` - Búsqueda general
- `?color=Negro` - Por color

## 🎨 Frontend

Los productos ahora se cargarán desde la base de datos real. No más placeholders.

### Asegúrate de:
1. El backend esté corriendo en `http://localhost:5000`
2. El frontend en `npm run serve`
3. Las imágenes estén en la carpeta `public/Productos/` (o usar URLs reales)

## 🖼️ Imágenes de Productos

Las imágenes actuales usan rutas como `/Productos/laptop-dell-inspiron.jpg`. Puedes:

**Opción A**: Colocar imágenes reales en `frontend-chpc/public/Productos/`
**Opción B**: Actualizar las URLs en la base de datos después del seed
**Opción C**: Modificar el seed para usar URLs externas o placeholders temporales

Ejemplo para actualizar URLs después del seed:
```javascript
// Crear archivo update-images.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.product.updateMany({
    data: {
      imagen_url: '/Productos/default-product.jpg'
    }
  });
}

main().finally(() => prisma.$disconnect());
```

## ⚠️ Notas Importantes

1. **Limpieza de datos**: El script `seed-products.js` **borra todos los productos** existentes antes de insertar los nuevos. Comenta la línea `await prisma.product.deleteMany({});` si quieres mantener productos existentes.

2. **Imágenes**: Las rutas de imagen son placeholders. Necesitarás agregar imágenes reales o actualizar las rutas.

3. **Stock**: Los productos tienen stock definido. El sistema puede mostrar "sin stock" si el valor es 0.

4. **Precios**: Todos los precios están en USD ($). Los usuarios autenticados verán los precios.

## 🔄 Próximos Pasos

1. ✅ Base de datos configurada con productos reales
2. 📸 Agregar imágenes reales de productos
3. 🏷️ Configurar promociones si es necesario
4. 🎨 Ajustar el frontend para mostrar categorías
5. 🔍 Implementar filtros avanzados en la UI

## 🆘 Solución de Problemas

### Error: "Cannot find module '@prisma/client'"
```bash
npm install @prisma/client
npx prisma generate
```

### Error: "Database connection failed"
Verifica tu `.env` tenga configurado correctamente `DATABASE_URL`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
```

### Los productos no aparecen en el frontend
1. Verifica que el backend esté corriendo
2. Revisa la consola del navegador para errores de CORS
3. Confirma que la URL de la API sea correcta (`http://localhost:5000`)

## 📚 Recursos

- [Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Prisma Client](https://www.prisma.io/docs/concepts/components/prisma-client)
- [NestJS Prisma](https://docs.nestjs.com/recipes/prisma)

---

¡Listo! Ahora tienes una base de datos poblada con productos reales para hacer pruebas sin depender del ERP. 🎉
