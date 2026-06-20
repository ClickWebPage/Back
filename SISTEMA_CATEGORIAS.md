# Sistema de Categorización de Productos

Este documento explica cómo funciona el sistema de categorización automática de productos basado en palabras clave.

## 📋 Descripción General

El sistema clasifica automáticamente los productos en categorías basándose en palabras clave presentes en el nombre del producto. Por ejemplo:
- Productos con "laptop" en el nombre → Categoría "Laptops"
- Productos con "tinta" o "toner" → Categoría "Tintas y Toners"

## 🎯 Categorías Predefinidas

Las categorías están configuradas en `src/products/config/product-categories.config.ts`:

```typescript
export const PRODUCT_CATEGORIES: ProductCategory[] = [
  {
    name: 'Laptops',
    keywords: ['laptop', 'notebook', 'ultrabook', 'chromebook'],
    priority: 1,
  },
  {
    name: 'Tintas y Toners',
    keywords: ['tinta', 'toner', 'cartucho', 'ribbon'],
    priority: 2,
  },
  {
    name: 'Impresoras',
    keywords: ['impresora', 'printer', 'multifuncional', 'escaner'],
    priority: 3,
  },
  {
    name: 'Monitores',
    keywords: ['monitor', 'pantalla', 'display'],
    priority: 4,
  },
  {
    name: 'Accesorios',
    keywords: ['mouse', 'teclado', 'keyboard', 'audifono', 'auricular', 'camara', 'webcam'],
    priority: 5,
  },
  {
    name: 'Almacenamiento',
    keywords: ['disco duro', 'hdd', 'ssd', 'memoria usb', 'pendrive', 'microsd'],
    priority: 6,
  },
  {
    name: 'Componentes',
    keywords: ['procesador', 'memoria ram', 'tarjeta', 'motherboard', 'fuente', 'cooler'],
    priority: 7,
  },
  {
    name: 'Redes',
    keywords: ['router', 'switch', 'cable', 'antena', 'modem', 'wifi'],
    priority: 8,
  },
  {
    name: 'Software',
    keywords: ['office', 'windows', 'antivirus', 'licencia'],
    priority: 9,
  },
  {
    name: 'Otros',
    keywords: [], // Categoría por defecto
    priority: 99,
  },
];
```

## 🔧 Cómo Agregar Nuevas Categorías

Para agregar una nueva categoría, edita el archivo `src/products/config/product-categories.config.ts`:

```typescript
{
  name: 'Nueva Categoría',
  keywords: ['palabra1', 'palabra2', 'palabra3'],
  priority: 10, // Menor número = mayor prioridad
}
```

**Consejos:**
- Las palabras clave no son sensibles a mayúsculas/minúsculas
- La búsqueda es por inclusión (si el nombre del producto **contiene** la palabra clave)
- El sistema asigna la primera categoría que coincida según la prioridad
- Si no hay coincidencias, se asigna a "Otros"

## 📡 Endpoints de la API

### 1. Obtener lista de categorías

**GET** `/api/tienda/productos/categorias/lista`

Devuelve todas las categorías con el conteo de productos que pertenecen a cada una.

**Respuesta:**
```json
[
  {
    "nombre_categoria": "Laptops",
    "total_productos": 45
  },
  {
    "nombre_categoria": "Tintas y Toners",
    "total_productos": 120
  },
  {
    "nombre_categoria": "Impresoras",
    "total_productos": 30
  }
]
```

### 2. Filtrar productos por categoría

**GET** `/api/tienda/productos?categoria=Laptops`

Parámetros de consulta disponibles:
- `categoria`: Nombre de la categoría (ej: "Laptops", "Tintas y Toners")
- `marca`: Filtrar por marca
- `search`: Búsqueda de texto libre
- `minCosto`: Precio mínimo
- `maxCosto`: Precio máximo
- `page`: Número de página
- `limit`: Productos por página

**Ejemplo de solicitud completa:**
```
GET /api/tienda/productos?categoria=Laptops&marca=Dell&page=1&limit=20
```

**Respuesta:**
```json
{
  "data": [
    {
      "codigo": 1234,
      "producto": "LAPTOP DELL INSPIRON 15",
      "marca": "Dell",
      "categoria": "Laptops",
      "precioA": 799.99,
      "imagen_url": "/uploads/productos/laptop-dell.jpg",
      "existenciaTotal": "5"
    }
  ],
  "total": 15,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

### 3. Obtener productos (con categoría incluida)

**GET** `/api/tienda/productos`

Todos los productos ahora incluyen un campo `categoria` calculado automáticamente:

```json
{
  "codigo": 5678,
  "producto": "TINTA HP 664 NEGRO",
  "marca": "HP",
  "categoria": "Tintas y Toners",
  "precioA": 25.99
}
```

## 💻 Uso en el Frontend

### Obtener categorías disponibles

```javascript
import { API_BASE_URL } from '@/config/api';
import axios from 'axios';

async function obtenerCategorias() {
  const response = await axios.get(`${API_BASE_URL}/tienda/productos/categorias/lista`);
  return response.data;
}
```

### Filtrar productos por categoría

```javascript
async function obtenerProductosPorCategoria(nombreCategoria, page = 1, limit = 20) {
  const response = await axios.get(`${API_BASE_URL}/tienda/productos`, {
    params: {
      categoria: nombreCategoria,
      page,
      limit
    }
  });
  return response.data;
}

// Ejemplo de uso
const productos = await obtenerProductosPorCategoria('Laptops', 1, 20);
```

### Filtrar con múltiples parámetros

```javascript
async function buscarProductos(filtros) {
  const params = {
    categoria: filtros.categoria || undefined,
    marca: filtros.marca || undefined,
    search: filtros.busqueda || undefined,
    minCosto: filtros.precioMin || undefined,
    maxCosto: filtros.precioMax || undefined,
    page: filtros.page || 1,
    limit: filtros.limit || 20
  };
  
  const response = await axios.get(`${API_BASE_URL}/tienda/productos`, { params });
  return response.data;
}

// Ejemplo de uso
const productos = await buscarProductos({
  categoria: 'Laptops',
  marca: 'Dell',
  precioMin: 500,
  precioMax: 2000,
  page: 1,
  limit: 20
});
```

## 🎨 Componente Vue Actualizado

El componente `CategoriasProductos.vue` ya está actualizado para usar el nuevo sistema:

```javascript
// src/components/CategoriasProductos/CategoriasProductos.js

async cargarCategorias() {
  this.cargandoCategorias = true;
  try {
    const response = await axios.get(`${API_BASE_URL}/tienda/productos/categorias/lista`);
    
    this.categorias = response.data.map((cat, index) => ({
      id: index + 1,
      nombre: cat.nombre_categoria,
      slug: this.generarSlug(cat.nombre_categoria),
      icono: this.obtenerIconoCategoria(cat.nombre_categoria),
      cantidad: cat.total_productos,
    }));
  } catch (error) {
    console.error('Error al cargar categorías:', error);
  } finally {
    this.cargandoCategorias = false;
  }
}
```

## 🧪 Ejemplos de Prueba

### Prueba con cURL

```bash
# Obtener categorías
curl http://localhost:5000/api/tienda/productos/categorias/lista

# Filtrar por categoría
curl "http://localhost:5000/api/tienda/productos?categoria=Laptops"

# Filtrar con múltiples parámetros
curl "http://localhost:5000/api/tienda/productos?categoria=Tintas%20y%20Toners&marca=HP&limit=10"
```

### Prueba con Postman/Thunder Client

**GET** `http://localhost:5000/api/tienda/productos/categorias/lista`

**GET** `http://localhost:5000/api/tienda/productos?categoria=Laptops&page=1&limit=20`

## 📝 Notas Importantes

1. **Clasificación Automática**: Los productos se clasifican automáticamente cada vez que se consultan, no se guarda la categoría en la base de datos.

2. **Prioridad de Categorías**: Si un producto coincide con múltiples categorías, se asigna a la de mayor prioridad (menor número).

3. **Rendimiento**: El filtro por categoría es post-procesado (después de la consulta SQL), por lo que el conteo total puede necesitar recalcularse.

4. **Personalización**: Las categorías y palabras clave son completamente personalizables editando el archivo de configuración.

5. **Categoría "Otros"**: Los productos que no coincidan con ninguna categoría se asignan automáticamente a "Otros".

## 🐛 Solución de Problemas

### Los productos no se categorizan correctamente

- Verifica que las palabras clave incluyan variaciones comunes (singular/plural, con/sin acentos)
- Las palabras clave buscan coincidencias parciales, no palabras completas

### El filtro de categoría no devuelve resultados

- Asegúrate de usar el nombre exacto de la categoría (sensible a mayúsculas)
- Verifica que la categoría existe en la configuración

### Agregar nuevas palabras clave

Edita `product-categories.config.ts` y reinicia el servidor del backend.

## 🚀 Próximas Mejoras

- [ ] Guardar la categoría en la base de datos para mejorar el rendimiento
- [ ] API para administrar categorías sin editar código
- [ ] Soporte para sub-categorías
- [ ] Múltiples categorías por producto
- [ ] Sistema de etiquetas adicional
