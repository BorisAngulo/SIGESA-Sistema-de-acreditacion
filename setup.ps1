# Script de instalación SIGESA para PowerShell
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " SIGESA - Instalación Automática" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si Docker está instalado
try {
    $dockerVersion = docker --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Docker está instalado: $dockerVersion" -ForegroundColor Green
    } else {
        throw "Docker no encontrado"
    }
} catch {
    Write-Host "❌ Error: Docker no está instalado" -ForegroundColor Red
    Write-Host ""
    Write-Host "Por favor instala Docker Desktop desde:" -ForegroundColor Yellow
    Write-Host "https://www.docker.com/products/docker-desktop/" -ForegroundColor Blue
    Read-Host "Presiona Enter para continuar"
    exit 1
}

# Verificar si Docker está corriendo
try {
    docker info 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Docker está corriendo" -ForegroundColor Green
    } else {
        throw "Docker no está corriendo"
    }
} catch {
    Write-Host "❌ Error: Docker no está corriendo" -ForegroundColor Red
    Write-Host ""
    Write-Host "Por favor inicia Docker Desktop e intenta de nuevo" -ForegroundColor Yellow
    Read-Host "Presiona Enter para continuar"
    exit 1
}

# Verificar/crear archivo .env
if (-not (Test-Path ".env")) {
    Write-Host ""
    Write-Host "📋 Creando archivo de configuración..." -ForegroundColor Yellow
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "✅ Archivo .env creado desde .env.example" -ForegroundColor Green
    } else {
        Write-Host "❌ Error: No se encontró .env.example" -ForegroundColor Red
        Read-Host "Presiona Enter para continuar"
        exit 1
    }
} else {
    Write-Host "✅ Archivo .env ya existe" -ForegroundColor Green
}

Write-Host ""
Write-Host "🚀 Iniciando servicios de SIGESA..." -ForegroundColor Blue
Write-Host ""

# Iniciar servicios con docker-compose
try {
    docker-compose -f docker-compose.dev.yml up -d
    if ($LASTEXITCODE -ne 0) {
        throw "Error al iniciar servicios"
    }
} catch {
    Write-Host ""
    Write-Host "❌ Error al iniciar los servicios" -ForegroundColor Red
    Write-Host "Revisa los logs con: docker-compose -f docker-compose.dev.yml logs" -ForegroundColor Yellow
    Read-Host "Presiona Enter para continuar"
    exit 1
}

Write-Host ""
Write-Host "⏳ Esperando que los servicios estén listos..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

Write-Host ""
Write-Host "🗄️ Configurando base de datos..." -ForegroundColor Blue

# Generar clave de aplicación si no existe
$envContent = Get-Content ".env" -Raw
if ($envContent -notmatch "APP_KEY=base64:") {
    Write-Host "🔑 Generando clave de aplicación..." -ForegroundColor Yellow
    docker exec sigesa_backend php artisan key:generate --force
}

# Ejecutar migraciones
Write-Host "📊 Ejecutando migraciones..." -ForegroundColor Yellow
try {
    docker exec sigesa_backend php artisan migrate --force
} catch {
    Write-Host "⚠️ Error en migraciones, pero continuando..." -ForegroundColor Orange
}

# Ejecutar seeders
Write-Host "🌱 Poblando base de datos con datos iniciales..." -ForegroundColor Yellow
try {
    docker exec sigesa_backend php artisan db:seed --force
} catch {
    Write-Host "⚠️ Error en seeders, pero continuando..." -ForegroundColor Orange
}

Write-Host ""
Write-Host "✅ INSTALACIÓN COMPLETADA" -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " 🌐 ACCESO A LA APLICACIÓN" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Frontend (React):     http://localhost:3000" -ForegroundColor Blue
Write-Host "Backend API:          http://localhost:8000" -ForegroundColor Blue
Write-Host "API Documentation:    http://localhost:8000/api/documentation" -ForegroundColor Blue
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " 🛠️ COMANDOS ÚTILES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Ver estado:           docker ps" -ForegroundColor Gray
Write-Host "Parar servicios:     docker-compose -f docker-compose.dev.yml down" -ForegroundColor Gray
Write-Host "Ver logs backend:     docker logs sigesa_backend" -ForegroundColor Gray
Write-Host "Ver logs frontend:    docker logs sigesa_frontend-1" -ForegroundColor Gray
Write-Host ""

$openBrowser = Read-Host "¿Deseas abrir el navegador? (s/n)"
if ($openBrowser -eq "s" -or $openBrowser -eq "S" -or $openBrowser -eq "") {
    Start-Process "http://localhost:3000"
}

Write-Host ""
Write-Host "¡Disfruta usando SIGESA! 🎉" -ForegroundColor Green