# =========================================================
# Script para probar el API de Work Orders
# =========================================================
# Ejecutar desde PowerShell en el directorio del backend
# 
# Uso:
#   .\test-work-orders.ps1
#   .\test-work-orders.ps1 -Token "tu_token_jwt"
#   .\test-work-orders.ps1 -ApiUrl "http://localhost:3000/api"

param(
    [string]$ApiUrl = "http://localhost:5000/api",
    [string]$Token = "",
    [string]$Username = "admin",
    [string]$Password = "admin123"
)

# Función para manejar errores
function Write-ErrorInfo {
    param($ErrorRecord)
    Write-Host "❌ Error: $($ErrorRecord.Exception.Message)" -ForegroundColor Red
    if ($ErrorRecord.ErrorDetails) {
        Write-Host "   Detalles: $($ErrorRecord.ErrorDetails.Message)" -ForegroundColor Red
    }
}

# Banner
Write-Host ""
Write-Host "╔════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     PRUEBAS API WORK ORDERS - CHPC            ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "API URL: $ApiUrl" -ForegroundColor Gray

# 0. Obtener token JWT si no se proporcionó
if ([string]::IsNullOrEmpty($Token)) {
    Write-Host "`n0. Obteniendo token JWT..." -ForegroundColor Yellow
    try {
        $loginBody = @{
            username = $Username
            password = $Password
        } | ConvertTo-Json

        $loginResponse = Invoke-RestMethod -Uri "$ApiUrl/auth/login" `
            -Method Post `
            -Headers @{"Content-Type" = "application/json"} `
            -Body $loginBody

        $Token = $loginResponse.access_token
        Write-Host "✓ Token obtenido exitosamente" -ForegroundColor Green
    } catch {
        Write-ErrorInfo $_
        Write-Host "`nNo se pudo obtener el token. Proporciona uno con -Token o verifica las credenciales." -ForegroundColor Yellow
        exit 1
    }
}

# Variables globales para las pruebas
$workOrderId = $null
$trackingId = $null
$headers = @{
    "Authorization" = "Bearer $Token"
    "Content-Type" = "application/json"
}

# 1. Crear una orden de trabajo
Write-Host "`n[1/12] Creando orden de trabajo..." -ForegroundColor Yellow
try {
    $body = @{
        cliente_nombre = "Juan Pérez García"
        cliente_telefono = "555-1234"
        cliente_email = "juan.perez@example.com"
        marca_equipo = "Dell"
        modelo_equipo = "Inspiron 15 3000"
        numero_serie = "SN-ABC123XYZ456"
        descripcion_problema = "La laptop no enciende, no muestra señales de vida. Al conectar el cargador no hay luz indicadora."
        costo_estimado = 50.00
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$ApiUrl/work-orders" `
        -Method Post `
        -Headers $headers `
        -Body $body

    $workOrderId = $response.id
    $trackingId = $response.trackingId
    Write-Host "   ✓ Orden creada exitosamente" -ForegroundColor Green
    Write-Host "   → ID: $workOrderId" -ForegroundColor White
    Write-Host "   → Tracking: $trackingId" -ForegroundColor White
    Write-Host "   → Cliente: $($response.cliente_nombre)" -ForegroundColor White
    Write-Host "   → Estado: $($response.estado)" -ForegroundColor White
} catch {
    Write-ErrorInfo $_
}

# 2. Obtener todas las órdenes
Write-Host "`n[2/12] Obteniendo todas las órdenes..." -ForegroundColor Yellow
try {
    $ordenes = Invoke-RestMethod -Uri "$ApiUrl/work-orders" `
        -Method Get `
        -Headers $headers

    Write-Host "   ✓ Órdenes obtenidas: $($ordenes.Count) total(es)" -ForegroundColor Green
    if ($ordenes.Count -gt 0) {
        Write-Host "   → Última orden: $($ordenes[0].trackingId) - $($ordenes[0].cliente_nombre)" -ForegroundColor White
    }
} catch {
    Write-ErrorInfo $_
}

# 3. Obtener orden por ID
Write-Host "`n[3/12] Obteniendo orden por ID ($workOrderId)..." -ForegroundColor Yellow
try {
    $orden = Invoke-RestMethod -Uri "$ApiUrl/work-orders/$workOrderId" `
        -Method Get `
        -Headers $headers

    Write-Host "   ✓ Orden obtenida: $($orden.trackingId)" -ForegroundColor Green
    Write-Host "   → Marca: $($orden.marca_equipo) $($orden.modelo_equipo)" -ForegroundColor White
    Write-Host "   → Problema: $($orden.descripcion_problema.Substring(0, [Math]::Min(50, $orden.descripcion_problema.Length)))..." -ForegroundColor White
} catch {
    Write-ErrorInfo $_
}

# 4. Obtener orden por tracking ID (público)
Write-Host "`n[4/12] Obteniendo orden por tracking ID ($trackingId)..." -ForegroundColor Yellow
try {
    $ordenTracking = Invoke-RestMethod -Uri "$ApiUrl/work-orders/tracking/$trackingId" `
        -Method Get `
        -Headers $headers

    Write-Host "   ✓ Orden obtenida: $($ordenTracking.cliente_nombre)" -ForegroundColor Green
    Write-Host "   → Estado actual: $($ordenTracking.estado)" -ForegroundColor White
} catch {
    Write-ErrorInfo $_
}

# 5. Asignar técnico
Write-Host "`n[5/12] Asignando técnico a la orden..." -ForegroundColor Yellow
try {
    $assignBody = @{
        tecnico_nombre = "Carlos Técnico Rodríguez"
    } | ConvertTo-Json

    $asignada = Invoke-RestMethod -Uri "$ApiUrl/work-orders/$workOrderId/asignar" `
        -Method Post `
        -Headers $headers `
        -Body $assignBody

    Write-Host "   ✓ Técnico asignado: $($asignada.tecnico_nombre)" -ForegroundColor Green
    Write-Host "   → ID Técnico: $($asignada.tecnico_id)" -ForegroundColor White
} catch {
    Write-ErrorInfo $_
}

# 6. Cambiar estado a EN_REVISION
Write-Host "`n[6/12] Cambiando estado a EN_REVISION..." -ForegroundColor Yellow
try {
    $statusBody = @{
        estado = "EN_REVISION"
    } | ConvertTo-Json

    $actualizada = Invoke-RestMethod -Uri "$ApiUrl/work-orders/$workOrderId/estado" `
        -Method Patch `
        -Headers $headers `
        -Body $statusBody

    Write-Host "   ✓ Estado actualizado: $($actualizada.estado)" -ForegroundColor Green
} catch {
    Write-ErrorInfo $_
}

# 7. Actualizar orden (agregar notas técnicas)
Write-Host "`n[7/12] Agregando notas técnicas y costo final..." -ForegroundColor Yellow
try {
    $updateBody = @{
        notas_tecnicas = "Se revisó la laptop. Problema identificado: fuente de poder interna dañada. Se requiere reemplazo de componente. Tiempo estimado: 2-3 días hábiles."
        costo_final = 75.50
    } | ConvertTo-Json

    $modificada = Invoke-RestMethod -Uri "$ApiUrl/work-orders/$workOrderId" `
        -Method Patch `
        -Headers $headers `
        -Body $updateBody

    Write-Host "   ✓ Notas técnicas agregadas" -ForegroundColor Green
    Write-Host "   → Costo estimado: $$($modificada.costo_estimado)" -ForegroundColor White
    Write-Host "   → Costo final: $$($modificada.costo_final)" -ForegroundColor White
} catch {
    Write-ErrorInfo $_
}

# 8. Obtener estadísticas
Write-Host "`n[8/12] Obteniendo estadísticas generales..." -ForegroundColor Yellow
try {
    $stats = Invoke-RestMethod -Uri "$ApiUrl/work-orders/statistics" `
        -Method Get `
        -Headers $headers

    Write-Host "   ✓ Estadísticas obtenidas:" -ForegroundColor Green
    Write-Host "   ├─ Total: $($stats.total)" -ForegroundColor White
    Write-Host "   ├─ En espera: $($stats.enEspera)" -ForegroundColor Yellow
    Write-Host "   ├─ En revisión: $($stats.enRevision)" -ForegroundColor Cyan
    Write-Host "   ├─ Reparados: $($stats.reparados)" -ForegroundColor Green
    Write-Host "   ├─ Entregados: $($stats.entregados)" -ForegroundColor Green
    Write-Host "   ├─ Sin reparación: $($stats.sinReparacion)" -ForegroundColor Red
    Write-Host "   ├─ Cancelados: $($stats.cancelados)" -ForegroundColor Red
    Write-Host "   └─ Disponibles: $($stats.disponibles)" -ForegroundColor Yellow
} catch {
    Write-ErrorInfo $_
}

# 9. Cambiar estado a REPARADO
Write-Host "`n[9/12] Cambiando estado a REPARADO..." -ForegroundColor Yellow
try {
    $statusBody2 = @{
        estado = "REPARADO"
    } | ConvertTo-Json

    $reparada = Invoke-RestMethod -Uri "$ApiUrl/work-orders/$workOrderId/estado" `
        -Method Patch `
        -Headers $headers `
        -Body $statusBody2

    Write-Host "   ✓ Estado actualizado: $($reparada.estado)" -ForegroundColor Green
    Write-Host "   → Equipo listo para entregar" -ForegroundColor White
} catch {
    Write-ErrorInfo $_
}

# 10. Filtrar órdenes disponibles
Write-Host "`n[10/12] Filtrando órdenes disponibles (sin técnico)..." -ForegroundColor Yellow
try {
    $disponibles = Invoke-RestMethod -Uri "$ApiUrl/work-orders?disponibles=true" `
        -Method Get `
        -Headers $headers

    Write-Host "   ✓ Órdenes disponibles: $($disponibles.Count)" -ForegroundColor Green
    if ($disponibles.Count -gt 0) {
        Write-Host "   → Primera disponible: $($disponibles[0].trackingId)" -ForegroundColor White
    }
} catch {
    Write-ErrorInfo $_
}

# 11. Filtrar por estado
Write-Host "`n[11/12] Filtrando órdenes REPARADAS..." -ForegroundColor Yellow
try {
    $reparadas = Invoke-RestMethod -Uri "$ApiUrl/work-orders?estado=REPARADO" `
        -Method Get `
        -Headers $headers

    Write-Host "   ✓ Órdenes reparadas: $($reparadas.Count)" -ForegroundColor Green
} catch {
    Write-ErrorInfo $_
}

# 12. Cambiar estado a ENTREGADO
Write-Host "`n[12/12] Marcando orden como ENTREGADA..." -ForegroundColor Yellow
try {
    $statusBody3 = @{
        estado = "ENTREGADO"
    } | ConvertTo-Json

    $entregada = Invoke-RestMethod -Uri "$ApiUrl/work-orders/$workOrderId/estado" `
        -Method Patch `
        -Headers $headers `
        -Body $statusBody3

    Write-Host "   ✓ Estado final: $($entregada.estado)" -ForegroundColor Green
    if ($entregada.fecha_entrega) {
        Write-Host "   → Fecha entrega: $($entregada.fecha_entrega)" -ForegroundColor White
    }
} catch {
    Write-ErrorInfo $_
}

# Resumen final
Write-Host ""
Write-Host "╔════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         PRUEBAS COMPLETADAS                    ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Resumen de la orden de prueba:" -ForegroundColor White
Write-Host "   • Tracking ID: $trackingId" -ForegroundColor Yellow
Write-Host "   • ID Interno: $workOrderId" -ForegroundColor Yellow
Write-Host "   • Cliente: Juan Pérez García" -ForegroundColor White
Write-Host "   • Estado Final: ENTREGADO" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Puedes consultar la orden públicamente en:" -ForegroundColor Gray
Write-Host "   GET $ApiUrl/work-orders/tracking/$trackingId" -ForegroundColor Gray
Write-Host ""