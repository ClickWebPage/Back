# Test del Backend CHPC - Autenticacion
Write-Host "`nIniciando pruebas del backend CHPC...`n" -ForegroundColor Cyan

# Variables globales
$baseUrl = "http://localhost:5000/api"
$accessToken = ""
$refreshToken = ""

# Test 1: Registro de usuario
Write-Host "📝 Test 1: Registro de usuario" -ForegroundColor Yellow
try {
    $body = @{
        nombre_usuario = "testuser123"
        email = "test@example.com"
        contraseña = "Test123!@"
        telefono = "0999123456"
        direccion = "Manta, Ecuador"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/auth/registro" -Method POST -ContentType "application/json" -Body $body
    Write-Host "✅ Registro exitoso" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "❌ Error en registro: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host $_.ErrorDetails.Message -ForegroundColor Red
    }
}

Start-Sleep -Seconds 2

# Test 2: Login
Write-Host "`n🔐 Test 2: Login de usuario" -ForegroundColor Yellow
try {
    $body = @{
        nombre_usuario = "testuser123"
        contraseña = "Test123!@"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -ContentType "application/json" -Body $body
    $accessToken = $response.access_token
    $refreshToken = $response.refresh_token
    
    Write-Host "✅ Login exitoso" -ForegroundColor Green
    Write-Host "Access Token: $($accessToken.Substring(0, 50))..." -ForegroundColor Gray
    Write-Host "Refresh Token: $($refreshToken.Substring(0, 50))..." -ForegroundColor Gray
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "❌ Error en login: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host $_.ErrorDetails.Message -ForegroundColor Red
    }
}

Start-Sleep -Seconds 2

# Test 3: Verificar token
Write-Host "`n✔️ Test 3: Verificar token" -ForegroundColor Yellow
try {
    $headers = @{
        Authorization = "Bearer $accessToken"
    }
    
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/verificar" -Method GET -Headers $headers
    Write-Host "✅ Token válido" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "❌ Error al verificar token: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host $_.ErrorDetails.Message -ForegroundColor Red
    }
}

Start-Sleep -Seconds 2

# Test 4: Obtener perfil
Write-Host "`n👤 Test 4: Obtener perfil de usuario" -ForegroundColor Yellow
try {
    $headers = @{
        Authorization = "Bearer $accessToken"
    }
    
    $response = Invoke-RestMethod -Uri "$baseUrl/usuarios/perfil" -Method GET -Headers $headers
    Write-Host "✅ Perfil obtenido" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "❌ Error al obtener perfil: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host $_.ErrorDetails.Message -ForegroundColor Red
    }
}

Start-Sleep -Seconds 2

# Test 5: Actualizar perfil
Write-Host "`n📝 Test 5: Actualizar perfil" -ForegroundColor Yellow
try {
    $headers = @{
        Authorization = "Bearer $accessToken"
    }
    
    $body = @{
        telefono = "0987654321"
        direccion = "Nueva dirección en Manta, Ecuador"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/usuarios/perfil" -Method PATCH -ContentType "application/json" -Headers $headers -Body $body
    Write-Host "✅ Perfil actualizado" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "❌ Error al actualizar perfil: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host $_.ErrorDetails.Message -ForegroundColor Red
    }
}

Start-Sleep -Seconds 2

# Test 6: Refrescar token
Write-Host "`n🔄 Test 6: Refrescar access token" -ForegroundColor Yellow
try {
    $body = @{
        refresh_token = $refreshToken
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/auth/refresh" -Method POST -ContentType "application/json" -Body $body
    Write-Host "✅ Token refrescado" -ForegroundColor Green
    Write-Host "Nuevo Access Token: $($response.access_token.Substring(0, 50))..." -ForegroundColor Gray
} catch {
    Write-Host "❌ Error al refrescar token: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host $_.ErrorDetails.Message -ForegroundColor Red
    }
}

Start-Sleep -Seconds 2

# Test 7: Logout
Write-Host "`n🚪 Test 7: Cerrar sesión" -ForegroundColor Yellow
try {
    $headers = @{
        Authorization = "Bearer $accessToken"
    }
    
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/logout" -Method POST -Headers $headers
    Write-Host "✅ Sesión cerrada" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "❌ Error al cerrar sesión: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host $_.ErrorDetails.Message -ForegroundColor Red
    }
}

Write-Host "`n✅ Pruebas completadas`n" -ForegroundColor Cyan
