# Sistema de Métricas y Tracking de Visitas

## Descripción

Sistema completo para trackear y visualizar métricas de visitas a la página, productos más vistos y marcas más vistas en el panel de administración.

## Estructura

### Backend

#### Modelos de Prisma (schema.prisma)
- **PageView**: Registra visitas a páginas específicas
- **ProductView**: Registra visitas a productos
- **BrandView**: Registra visitas a marcas

#### Endpoints de Analytics

##### Tracking (Público - sin autenticación)
- `POST /analytics/track/page` - Registrar visita a página
- `POST /analytics/track/product` - Registrar visita a producto
- `POST /analytics/track/brand` - Registrar visita a marca

##### Métricas (Solo Admin)
- `GET /analytics/visitas/overview?periodo=30dias` - Resumen general
- `GET /analytics/visitas/paginas?periodo=30dias` - Stats de páginas
- `GET /analytics/visitas/productos?periodo=30dias&limite=20` - Productos más vistos
- `GET /analytics/visitas/marcas?periodo=30dias&limite=20` - Marcas más vistas

**Periodos válidos**: `7dias`, `30dias`, `3meses`, `año`

### Frontend

#### Servicio de Analytics
Ubicación: `src/services/analytics.js`

Funciones principales:
- `trackPageView(ruta)` - Trackear visita a página
- `trackProductView(productoId, productoNombre, marca)` - Trackear visita a producto
- `trackBrandView(marca)` - Trackear visita a marca
- `getVisitorsOverview(periodo)` - Obtener resumen de visitas
- `getPageViewsStats(periodo)` - Obtener stats de páginas
- `getProductViewsStats(periodo, limite)` - Obtener productos más vistos
- `getBrandViewsStats(periodo, limite)` - Obtener marcas más vistas

#### Componente AdminMetricas
Ubicación: `src/components/AdminPanel/AdminMetricas.vue`

Panel de visualización de métricas con:
- Cards de resumen (visitas totales, visitantes únicos, etc.)
- Gráfico de visitas por día
- Tabla de páginas más visitadas
- Tabla de productos más vistos
- Tabla de marcas más vistas

## Integración en Componentes

### 1. Trackear Visitas a Página

```javascript
// En cualquier componente donde quieras trackear visitas
import analyticsService from '@/services/analytics';

export default {
  name: 'MiComponente',
  mounted() {
    // Trackear cuando el componente se monta
    analyticsService.trackPageView('/ruta-de-la-pagina');
  }
}
```

### 2. Trackear Visitas a Producto

```javascript
// En un componente de detalle de producto
import analyticsService from '@/services/analytics';

export default {
  name: 'ProductDetail',
  props: ['producto'],
  mounted() {
    if (this.producto) {
      analyticsService.trackProductView(
        this.producto.codigo,
        this.producto.producto,
        this.producto.marca
      );
    }
  }
}
```

### 3. Trackear Visitas a Marca

```javascript
// En un componente de lista de marcas o filtro por marca
import analyticsService from '@/services/analytics';

export default {
  name: 'BrandList',
  methods: {
    async selectBrand(marca) {
      // Trackear cuando el usuario selecciona una marca
      analyticsService.trackBrandView(marca);
      
      // Continuar con la lógica de filtrado...
      this.filtrarPorMarca(marca);
    }
  }
}
```

### 4. Trackear en Rutas con Router

```javascript
// En router/index.js
import analyticsService from '@/services/analytics';

const router = new VueRouter({
  routes: [...],
});

// Trackear cada cambio de ruta
router.afterEach((to) => {
  analyticsService.trackPageView(to.path);
});

export default router;
```

## Ejemplos de Integración Completa

### Ejemplo 1: Componente de Producto

```vue
<template>
  <div class="producto-detalle">
    <h1>{{ producto.producto }}</h1>
    <p>Marca: {{ producto.marca }}</p>
    <!-- Resto del contenido -->
  </div>
</template>

<script>
import analyticsService from '@/services/analytics';

export default {
  name: 'ProductoDetalle',
  props: ['codigo'],
  data() {
    return {
      producto: null,
    };
  },
  async mounted() {
    await this.cargarProducto();
    
    // Trackear visita al producto después de cargarlo
    if (this.producto) {
      analyticsService.trackProductView(
        this.producto.codigo,
        this.producto.producto,
        this.producto.marca
      );
    }
  },
  methods: {
    async cargarProducto() {
      // Lógica para cargar el producto
      const response = await fetch(\`/api/productos/\${this.codigo}\`);
      this.producto = await response.json();
    }
  }
}
</script>
```

### Ejemplo 2: Componente de Lista de Marcas

```vue
<template>
  <div class="marcas-list">
    <div 
      v-for="marca in marcas" 
      :key="marca"
      @click="verMarca(marca)"
      class="marca-item"
    >
      {{ marca }}
    </div>
  </div>
</template>

<script>
import analyticsService from '@/services/analytics';

export default {
  name: 'MarcasList',
  data() {
    return {
      marcas: [],
    };
  },
  methods: {
    async verMarca(marca) {
      // Trackear visita a la marca
      await analyticsService.trackBrandView(marca);
      
      // Redirigir o filtrar productos
      this.$router.push(\`/productos?marca=\${marca}\`);
    }
  }
}
</script>
```

### Ejemplo 3: Tracking Global en App.vue

```vue
<script>
import analyticsService from '@/services/analytics';

export default {
  name: 'App',
  mounted() {
    // Trackear visita inicial
    analyticsService.trackPageView(this.$route.path);
  },
  watch: {
    '$route'(to) {
      // Trackear cada cambio de ruta
      analyticsService.trackPageView(to.path);
    }
  }
}
</script>
```

## Características del Sistema

### Session Tracking
- Cada visitante recibe un ID único de sesión almacenado en `sessionStorage`
- Permite contar visitantes únicos
- Se reinicia al cerrar la pestaña/navegador

### Usuario Tracking
- Si el usuario está autenticado, se registra su ID
- Permite análisis de comportamiento de usuarios registrados
- Útil para segmentación

### Información Capturada
- **IP Address**: Dirección IP del visitante
- **User Agent**: Navegador y dispositivo
- **Referrer**: De dónde vino el visitante
- **Timestamp**: Fecha y hora exacta de la visita

## Visualización de Métricas

### Acceso
1. Iniciar sesión como Admin
2. Ir a Panel de Administración
3. Seleccionar tab "Métricas"

### Métricas Disponibles
- **Total de Visitas**: Número total de visualizaciones de páginas
- **Visitantes Únicos**: Usuarios únicos identificados por session_id
- **Productos Vistos**: Total de visualizaciones de productos
- **Marcas Vistas**: Total de visualizaciones de marcas
- **Interacciones Totales**: Suma de todas las interacciones

### Filtros de Período
- Últimos 7 días
- Últimos 30 días (por defecto)
- Últimos 3 meses
- Último año

## Notas Técnicas

### Performance
- Los endpoints de tracking son públicos y no requieren autenticación
- Las inserciones son rápidas y no bloquean
- Se recomienda usar en mounted() o en eventos de usuario

### Privacidad
- Los IPs se almacenan pero pueden ser anonimizados
- Session IDs son únicos pero no identifican al usuario
- User IDs solo se registran si el usuario está autenticado

### Base de Datos
- Las tablas tienen índices optimizados para consultas rápidas
- Se recomienda implementar limpieza periódica de datos antiguos
- Las consultas de métricas están optimizadas con groupBy

## Próximas Mejoras

- [ ] Autolimpieza de datos antiguos (> 1 año)
- [ ] Exportación de reportes en PDF/Excel
- [ ] Gráficos más avanzados (Chart.js/D3.js)
- [ ] Segmentación por ubicación geográfica
- [ ] Análisis de rutas de navegación (customer journey)
- [ ] Tiempo promedio en página
- [ ] Tasa de rebote
- [ ] Conversión (visitas → compras)

## Troubleshooting

### El tracking no funciona
1. Verificar que el servicio esté importado correctamente
2. Revisar la consola del navegador por errores
3. Verificar que el backend esté ejecutándose
4. Revisar que las tablas existan en la base de datos

### Las métricas no muestran datos
1. Verificar que el usuario sea Admin
2. Confirmar que hay datos registrados en el período seleccionado
3. Revisar errores en la consola del navegador
4. Verificar conexión con el backend

### Problemas de performance
1. Limitar el número de registros con el parámetro `limite`
2. Usar períodos más cortos para consultas más rápidas
3. Implementar caché en el frontend
4. Considerar agregaciones precomputadas

## Soporte

Para más información o problemas, contactar al equipo de desarrollo.
