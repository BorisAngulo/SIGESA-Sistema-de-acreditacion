@echo off
REM Script de deployment para SIGESA en Windows
REM Uso: scripts\deploy.bat [desarrollo|produccion]

setlocal enabledelayedexpansion

set ENVIRONMENT=%1
if "%ENVIRONMENT%"=="" set ENVIRONMENT=desarrollo

echo 🚀 Iniciando deployment de SIGESA - Ambiente: %ENVIRONMENT%

REM Verificar Docker
echo 🔍 Verificando Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker no está instalado. Ejecuta scripts\check-docker.bat para más información.
    pause
    exit /b 1
)

docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker no está corriendo. Inicia Docker Desktop.
    pause
    exit /b 1
)

REM Determinar comando de Docker Compose
set DOCKER_COMPOSE_CMD=docker compose
docker compose version >nul 2>&1
if errorlevel 1 (
    set DOCKER_COMPOSE_CMD=docker-compose
    docker-compose --version >nul 2>&1
    if errorlevel 1 (
        echo ❌ Docker Compose no disponible
        pause
        exit /b 1
    )
)

echo ✅ Usando: %DOCKER_COMPOSE_CMD%

REM Validar que existe el archivo .env
if not exist .env (
    echo ❌ Archivo .env no encontrado. Copiando desde .env.docker.example...
    copy .env.docker.example .env
    echo ⚠️  IMPORTANTE: Edita el archivo .env con tus configuraciones antes de continuar.
    echo    Especialmente: APP_KEY, DB_PASSWORD, REDIS_PASSWORD
    pause
    exit /b 1
)

if "%ENVIRONMENT%"=="desarrollo" goto :deploy_dev
if "%ENVIRONMENT%"=="dev" goto :deploy_dev
if "%ENVIRONMENT%"=="development" goto :deploy_dev
if "%ENVIRONMENT%"=="produccion" goto :deploy_prod
if "%ENVIRONMENT%"=="prod" goto :deploy_prod
if "%ENVIRONMENT%"=="production" goto :deploy_prod

echo ❌ Ambiente no válido: %ENVIRONMENT%
echo Uso: %0 [desarrollo^|produccion]
exit /b 1

:deploy_dev
echo 🔧 Configurando ambiente de desarrollo...

REM Detener servicios existentes
%DOCKER_COMPOSE_CMD% -f docker-compose.yml -f docker-compose.dev.yml down

REM Construir imágenes
echo 🏗️ Construyendo imágenes...
%DOCKER_COMPOSE_CMD% -f docker-compose.yml -f docker-compose.dev.yml build --no-cache

REM Iniciar servicios
echo 🚀 Iniciando servicios...
%DOCKER_COMPOSE_CMD% -f docker-compose.yml -f docker-compose.dev.yml up -d

REM Esperar a que los servicios estén listos
echo ⏳ Esperando a que los servicios estén listos...
timeout /t 30 /nobreak

REM Ejecutar migraciones y seeders
echo 🔄 Ejecutando migraciones y seeders...
%DOCKER_COMPOSE_CMD% -f docker-compose.yml -f docker-compose.dev.yml exec backend php artisan migrate:fresh --seed

REM Mostrar estado de los servicios
%DOCKER_COMPOSE_CMD% -f docker-compose.yml -f docker-compose.dev.yml ps

echo ✅ Deployment de desarrollo completado!
echo 📱 Frontend: http://localhost:3000
echo 🔌 Backend API: http://localhost:8000/api
echo 🐘 PostgreSQL: localhost:5433
goto :end

:deploy_prod
echo 🏭 Configurando ambiente de producción...

REM Detener servicios existentes
%DOCKER_COMPOSE_CMD% -f docker-compose.yml -f docker-compose.prod.yml down

REM Construir imágenes para producción
echo 🏗️ Construyendo imágenes para producción...
%DOCKER_COMPOSE_CMD% -f docker-compose.yml -f docker-compose.prod.yml build --no-cache

REM Iniciar servicios
echo 🚀 Iniciando servicios de producción...
%DOCKER_COMPOSE_CMD% -f docker-compose.yml -f docker-compose.prod.yml up -d

REM Esperar a que los servicios estén listos
echo ⏳ Esperando a que los servicios estén listos...
timeout /t 45 /nobreak

REM Ejecutar migraciones
echo 🔄 Ejecutando migraciones...
%DOCKER_COMPOSE_CMD% -f docker-compose.yml -f docker-compose.prod.yml exec backend php artisan migrate --force

REM Optimizar Laravel para producción
echo ⚡ Optimizando Laravel para producción...
%DOCKER_COMPOSE_CMD% -f docker-compose.yml -f docker-compose.prod.yml exec backend php artisan config:cache
%DOCKER_COMPOSE_CMD% -f docker-compose.yml -f docker-compose.prod.yml exec backend php artisan route:cache
%DOCKER_COMPOSE_CMD% -f docker-compose.yml -f docker-compose.prod.yml exec backend php artisan view:cache

REM Mostrar estado de los servicios
%DOCKER_COMPOSE_CMD% -f docker-compose.yml -f docker-compose.prod.yml ps

echo ✅ Deployment de producción completado!
echo 🌐 Aplicación: http://localhost

:end
echo 🎉 ¡Deployment completado exitosamente!
pause