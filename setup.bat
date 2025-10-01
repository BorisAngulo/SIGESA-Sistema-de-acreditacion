@echo off
chcp 65001 >nul
echo.
echo ========================================
echo  SIGESA - Instalacion Automatica
echo ========================================
echo.

REM Verificar si Docker esta instalado
docker --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Error: Docker no esta instalado
    echo.
    echo Por favor instala Docker Desktop desde:
    echo https://www.docker.com/products/docker-desktop/
    pause
    exit /b 1
)

echo OK: Docker esta instalado

REM Verificar si Docker esta corriendo
docker info >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Error: Docker no esta corriendo
    echo.
    echo Por favor inicia Docker Desktop e intenta de nuevo
    pause
    exit /b 1
)

echo OK: Docker esta corriendo

REM Verificar si existe el archivo .env
if not exist ".env" (
    echo.
    echo Creando archivo de configuracion...
    if exist ".env.example" (
        copy ".env.example" ".env" >nul
        echo OK: Archivo .env creado desde .env.example
    ) else (
        echo Error: No se encontro .env.example
        echo Por favor crea el archivo .env manualmente
        pause
        exit /b 1
    )
) else (
    echo OK: Archivo .env ya existe
)

echo.
echo Iniciando servicios de SIGESA...
echo.

REM Iniciar servicios con docker-compose
docker-compose -f docker-compose.dev.yml up -d

if %ERRORLEVEL% neq 0 (
    echo.
    echo Error al iniciar los servicios
    echo Revisa los logs con: docker-compose -f docker-compose.dev.yml logs
    pause
    exit /b 1
)

echo.
echo Esperando que los servicios esten listos...
ping -n 31 127.0.0.1 >nul

echo.
echo Configurando base de datos...

REM Generar clave de aplicacion si no existe
findstr /r "APP_KEY=base64:" .env >nul
if %ERRORLEVEL% neq 0 (
    echo Generando clave de aplicacion...
    docker exec sigesa_backend php artisan key:generate --force
)

REM Ejecutar migraciones
echo Ejecutando migraciones...
docker exec sigesa_backend php artisan migrate --force

if %ERRORLEVEL% neq 0 (
    echo.
    echo Advertencia: Error en migraciones, pero continuando...
)

REM Ejecutar seeders
echo Poblando base de datos con datos iniciales...
docker exec sigesa_backend php artisan db:seed --force

if %ERRORLEVEL% neq 0 (
    echo.
    echo Advertencia: Error en seeders, pero continuando...
)

echo.
echo INSTALACION COMPLETADA
echo.
echo ========================================
echo  ACCESO A LA APLICACION
echo ========================================
echo.
echo Frontend React:     http://localhost:3000
echo Backend API:        http://localhost:8000
echo API Documentation: http://localhost:8000/api/documentation
echo.
echo ========================================
echo  COMANDOS UTILES
echo ========================================
echo.
echo Ver estado:           docker ps
echo Parar servicios:     docker-compose -f docker-compose.dev.yml down
echo Ver logs backend:     docker logs sigesa_backend
echo Ver logs frontend:    docker logs sigesa_frontend-1
echo.
echo Presiona cualquier tecla para abrir el navegador
pause >nul

REM Abrir navegador opcional
start http://localhost:3000

echo.
echo Disfruta usando SIGESA!