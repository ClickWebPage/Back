# Script para configurar el Firewall de Windows para CHPC
# Debe ejecutarse en PowerShell COMO ADMINISTRADOR

Write-Host "" 
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  CONFIGURAR FIREWALL - CHPC" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "" 

# Verificar si se está ejecutando como administrador
$windowsIdentity = [Security.Principal.WindowsIdentity]::GetCurrent()
$windowsPrincipal = New-Object Security.Principal.WindowsPrincipal($windowsIdentity)
$esAdmin = $windowsPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $esAdmin) {
    Write-Host "[ERROR] Este script debe ejecutarse como Administrador." -ForegroundColor Red
    Write-Host "        Cierra esta ventana, haz clic derecho en PowerShell" -ForegroundColor Yellow
    Write-Host "        y elige 'Ejecutar como administrador'." -ForegroundColor Yellow
    Write-Host "" 
    exit 1
}

Write-Host "[OK] Ejecutando como Administrador." -ForegroundColor Green
Write-Host "" 

# Puertos del proyecto
$puertos = @(
    @{ Nombre = "CHPC - Frontend 8080"; Puerto = 8080 },
    @{ Nombre = "CHPC - Backend 5000";  Puerto = 5000 }
)

foreach ($p in $puertos) {
    $nombre = $p.Nombre
    $puerto = $p.Puerto

    Write-Host "Configurando regla de firewall para puerto $puerto..." -ForegroundColor Yellow

    # Verificar si ya existe una regla con este nombre
    $reglaExistente = Get-NetFirewallRule -DisplayName $nombre -ErrorAction SilentlyContinue

    if ($reglaExistente) {
        Write-Host "  -> La regla '$nombre' ya existe. Actualizando configuración..." -ForegroundColor Cyan

        # Actualizar la regla existente (permitir desde red privada/local)
        Set-NetFirewallRule -DisplayName $nombre -Enabled True -Direction Inbound -Action Allow -Profile Private
        Set-NetFirewallRule -DisplayName $nombre -RemoteAddress LocalSubnet
    }
    else {
        Write-Host "  -> Creando regla '$nombre'..." -ForegroundColor Cyan

        New-NetFirewallRule \
            -DisplayName $nombre \
            -Direction Inbound \
            -Action Allow \
            -Protocol TCP \
            -LocalPort $puerto \
            -Profile Private \
            -RemoteAddress LocalSubnet | Out-Null
    }

    Write-Host "  -> Regla para puerto $puerto configurada." -ForegroundColor Green
    Write-Host "" 
}

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  FIREWALL CONFIGURADO" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "" 
Write-Host "Las máquinas de tu red local podrán acceder a:" -ForegroundColor Yellow
Write-Host "  Frontend: http://<TU_IP_LOCAL>:8080" -ForegroundColor White
Write-Host "  Backend:  http://<TU_IP_LOCAL>:5000/api" -ForegroundColor White
Write-Host "" 
Write-Host "Puedes verificar el estado con: .\\verificar-red.ps1 (sin admin)" -ForegroundColor Yellow
Write-Host "" 
