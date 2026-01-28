# 🧪 Tests del Backend CHPC

## 📡 Configuración
Base URL: http://localhost:5000/api

---

## 1️⃣ Test: Registro de Usuario

### Request
```powershell
$body = @{
    nombre_usuario = "testuser123"
    email = "test@example.com"
    contraseña = "Test123!@"
    telefono = "0999123456"
    direccion = "Manta, Ecuador"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/auth/registro" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body | Select-Object StatusCode, Content
```

### Respuesta Esperada
```json
{
  "mensaje": "Usuario registrado exitosamente",
  "usuario": {
    "id": 1,
    "nombre_usuario": "testuser123",
    "email": "test@example.com",
    "telefono": "0999123456",
    "direccion": "Manta, Ecuador",
    "rol": "cliente",
    "activo": true
  }
}
```

---

## 2️⃣ Test: Login

### Request
```powershell
$body = @{
    nombre_usuario = "testuser123"
    contraseña = "Test123!@"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body

$result = $response.Content | ConvertFrom-Json
$accessToken = $result.access_token
$refreshToken = $result.refresh_token

Write-Host "✅ Access Token: $accessToken"
Write-Host "✅ Refresh Token: $refreshToken"
$result
```

### Respuesta Esperada
```json
{
  "mensaje": "Inicio de sesión exitoso",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "nombre_usuario": "testuser123",
    "email": "test@example.com",
    "rol": "cliente"
  }
}
```

---

## 3️⃣ Test: Verificar Token

### Request
```powershell
# Usar el token del login anterior
Invoke-WebRequest -Uri "http://localhost:5000/api/auth/verificar" `
    -Method GET `
    -Headers @{ Authorization = "Bearer $accessToken" } | 
    Select-Object StatusCode, Content
```

### Respuesta Esperada
```json
{
  "valido": true,
  "usuario": {
    "id": 1,
    "username": "testuser123",
    "rol": "cliente"
  }
}
```

---

## 4️⃣ Test: Obtener Perfil

### Request
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/usuarios/perfil" `
    -Method GET `
    -Headers @{ Authorization = "Bearer $accessToken" } |
    Select-Object StatusCode, Content
```

---

## 5️⃣ Test: Actualizar Perfil

### Request
```powershell
$body = @{
    telefono = "0987654321"
    direccion = "Nueva dirección en Manta"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/usuarios/perfil" `
    -Method PATCH `
    -ContentType "application/json" `
    -Headers @{ Authorization = "Bearer $accessToken" } `
    -Body $body | Select-Object StatusCode, Content
```

---

## 6️⃣ Test: Refrescar Token

### Request
```powershell
$body = @{
    refresh_token = $refreshToken
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/auth/refresh" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body | Select-Object StatusCode, Content
```

---

## 7️⃣ Test: Logout

### Request
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/auth/logout" `
    -Method POST `
    -Headers @{ Authorization = "Bearer $accessToken" } |
    Select-Object StatusCode, Content
```

---

## 🚨 Tests de Validación (Errores Esperados)

### Test: Usuario duplicado
```powershell
$body = @{
    nombre_usuario = "testuser123"
    email = "test@example.com"
    contraseña = "Test123!@"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/auth/registro" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
# Esperado: 409 Conflict
```

### Test: Contraseña débil
```powershell
$body = @{
    nombre_usuario = "weakuser"
    email = "weak@example.com"
    contraseña = "123"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/auth/registro" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
# Esperado: 400 Bad Request - validación fallida
```

### Test: Login con credenciales incorrectas
```powershell
$body = @{
    nombre_usuario = "testuser123"
    contraseña = "WrongPassword123!@"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
# Esperado: 401 Unauthorized - "Le quedan X intentos"
```

### Test: Acceso sin token
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/usuarios/perfil" `
    -Method GET
# Esperado: 401 Unauthorized
```

---

## 📊 Resultados de Tests

| Test | Endpoint | Método | Estado |
|------|----------|--------|--------|
| Registro | /auth/registro | POST | ⏳ Pendiente |
| Login | /auth/login | POST | ⏳ Pendiente |
| Verificar | /auth/verificar | GET | ⏳ Pendiente |
| Perfil | /usuarios/perfil | GET | ⏳ Pendiente |
| Actualizar | /usuarios/perfil | PATCH | ⏳ Pendiente |
| Refresh | /auth/refresh | POST | ⏳ Pendiente |
| Logout | /auth/logout | POST | ⏳ Pendiente |
