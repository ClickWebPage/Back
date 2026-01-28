# Módulo Work Orders (Órdenes de Trabajo)

Este módulo gestiona las órdenes de trabajo para el servicio técnico del panel de técnicos.

## Modelo de Datos

### WorkOrder

```prisma
model WorkOrder {
  id                   Int              @id @default(autoincrement())
  trackingId           String           @unique // Ejemplo: WO-7241
  cliente_nombre       String
  cliente_telefono     String
  cliente_email        String?
  marca_equipo         String           // Ej: Asus, Dell
  modelo_equipo        String           // Ej: Vivobook 15
  numero_serie         String?
  descripcion_problema String
  notas_tecnicas       String?          // Solo para el técnico
  estado               WorkOrderStatus  @default(EN_ESPERA)
  costo_estimado       Float?           @default(0)
  costo_final          Float?
  tecnico_id           Int?
  tecnico_nombre       String?
  fecha_creacion       DateTime         @default(now())
  fecha_actualizacion  DateTime         @updatedAt
  fecha_entrega        DateTime?
  userId               Int?
  user                 User?
}
```

### Estados (WorkOrderStatus)

- `EN_ESPERA`: Orden recién creada, esperando asignación
- `EN_REVISION`: Técnico está revisando el equipo
- `REPARADO`: Equipo reparado, listo para entregar
- `ENTREGADO`: Equipo entregado al cliente
- `SIN_REPARACION`: No se puede o no vale la pena reparar
- `CANCELADO`: Orden cancelada

## Endpoints

### 1. Crear Orden de Trabajo
**POST** `/api/work-orders`

**Roles:** `administrador`, `tecnico`, `cliente`

**Body:**
```json
{
  "cliente_nombre": "Juan Pérez",
  "cliente_telefono": "555-1234",
  "cliente_email": "juan@example.com",
  "marca_equipo": "Dell",
  "modelo_equipo": "Inspiron 15",
  "numero_serie": "ABC123",
  "descripcion_problema": "No enciende",
  "costo_estimado": 50.00
}
```

**Response:**
```json
{
  "id": 1,
  "trackingId": "WO-1234",
  "cliente_nombre": "Juan Pérez",
  "estado": "EN_ESPERA",
  "fecha_creacion": "2026-01-21T13:00:00.000Z",
  ...
}
```

### 2. Obtener Todas las Órdenes
**GET** `/api/work-orders`

**Roles:** `administrador`, `tecnico`

**Query Params:**
- `estado`: Filtrar por estado (EN_ESPERA, EN_REVISION, etc.)
- `tecnico_id`: Filtrar por técnico asignado
- `disponibles=true`: Solo órdenes sin técnico asignado

**Response:**
```json
[
  {
    "id": 1,
    "trackingId": "WO-1234",
    "cliente_nombre": "Juan Pérez",
    "estado": "EN_ESPERA",
    ...
  }
]
```

### 3. Obtener Orden por ID
**GET** `/api/work-orders/:id`

**Roles:** `administrador`, `tecnico`, `cliente`

### 4. Obtener Orden por Tracking ID
**GET** `/api/work-orders/tracking/:trackingId`

**Público** (sin autenticación para consulta de clientes)

### 5. Actualizar Orden
**PATCH** `/api/work-orders/:id`

**Roles:** `administrador`, `tecnico` (solo si está asignado)

**Body:** Cualquier campo del DTO

### 6. Asignar Técnico
**POST** `/api/work-orders/:id/asignar`

**Roles:** `administrador`, `tecnico`

**Body:**
```json
{
  "tecnico_nombre": "Carlos Técnico"
}
```

### 7. Desasignar Técnico
**DELETE** `/api/work-orders/:id/desasignar`

**Roles:** `administrador`, `tecnico` (solo si está asignado)

### 8. Cambiar Estado
**PATCH** `/api/work-orders/:id/estado`

**Roles:** `administrador`, `tecnico` (solo si está asignado)

**Body:**
```json
{
  "estado": "EN_REVISION"
}
```

### 9. Obtener Estadísticas
**GET** `/api/work-orders/statistics`

**Roles:** `administrador`, `tecnico`

**Query Params:**
- `tecnico_id`: Filtrar por técnico específico

**Response:**
```json
{
  "total": 50,
  "enEspera": 10,
  "enRevision": 15,
  "reparados": 20,
  "entregados": 3,
  "sinReparacion": 1,
  "cancelados": 1,
  "disponibles": 10
}
```

### 10. Eliminar (Cancelar) Orden
**DELETE** `/api/work-orders/:id`

**Roles:** `administrador`

## Integración Frontend

El componente `PanelTecnicos.js` ya está configurado para usar estos endpoints. Asegúrate de:

1. Tener un token JWT válido en `localStorage.getItem('access_token')`
2. El usuario debe tener el rol `tecnico` o `administrador`
3. La variable de entorno `VUE_APP_API_URL` debe apuntar al backend

## Flujo de Trabajo Típico

1. **Cliente** crea una orden de trabajo (estado: `EN_ESPERA`)
2. **Técnico** ve las órdenes disponibles y se auto-asigna
3. **Técnico** cambia el estado a `EN_REVISION` mientras revisa
4. **Técnico** actualiza con notas técnicas y costo
5. **Técnico** cambia el estado a `REPARADO` cuando termina
6. **Técnico** o **Admin** cambia a `ENTREGADO` cuando el cliente recoge
7. Si no se puede reparar, se cambia a `SIN_REPARACION`

## Seguridad

- Autenticación JWT requerida para todos los endpoints (excepto tracking público)
- Los técnicos solo pueden modificar órdenes asignadas a ellos
- Los administradores tienen acceso completo
- Los clientes solo pueden crear órdenes y ver las suyas

## Migraciones

La migración se generó automáticamente con:
```bash
npx prisma migrate dev --name add_work_orders
```

Para aplicarla en producción:
```bash
npx prisma migrate deploy
```
