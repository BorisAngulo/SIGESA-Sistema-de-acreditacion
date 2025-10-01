@echo off
setlocal enabledelayedexpansion

echo ========================================
echo  SIGESA - Instalacion Automatica
echo ========================================
echo.

:: Verificar Docker
docker --version >nul 2>&1
if not !errorlevel! == 0 (
    echo ERROR: Docker no esta instalado
    echo Instala Docker Desktop desde: https://www.docker.com/products/docker-desktop/
    goto :error
)
echo OK: Docker esta instalado

:: Verificar que Docker este corriendo
docker info >nul 2>&1
if not !errorlevel! == 0 (
    echo ERROR: Docker no esta corriendo
    echo Inicia Docker Desktop e intenta de nuevo
    goto :error
)
echo OK: Docker esta corriendo

:: Crear archivo .env si no existe
if not exist ".env" (
    if exist ".env.example" (
        copy ".env.example" ".env" >nul 2>&1
        echo OK: Archivo .env creado
    ) else (
        echo ERROR: No se encontro .env.example
        goto :error
    )
) else (
    echo OK: Archivo .env ya existe
)

echo.
echo Iniciando servicios de SIGESA...
echo Esto puede tomar varios minutos...
echo.

:: Iniciar servicios
docker-compose -f docker-compose.dev.yml up -d
if not !errorlevel! == 0 (
    echo ERROR: No se pudieron iniciar los servicios
    goto :error
)

echo.
echo Esperando que los servicios esten listos...
ping -n 31 127.0.0.1 >nul

:: Configurar base de datos
echo.
echo Configurando base de datos...

:: Ejecutar migraciones
echo Ejecutando migraciones...
docker exec sigesa_backend php artisan migrate --force >nul 2>&1

:: Ejecutar seeders
echo Poblando base de datos...
docker exec sigesa_backend php artisan db:seed --force >nul 2>&1

echo.
echo ========================================
echo  INSTALACION COMPLETADA EXITOSAMENTE
echo ========================================
echo.
echo Accede a tu aplicacion en:
echo.
echo  Frontend:     http://localhost:3000
echo  Backend API:  http://localhost:8000
echo  Documentos:   http://localhost:8000/api/documentation
echo.
echo Comandos utiles:
echo  Ver estado:   docker ps
echo  Parar todo:   docker-compose -f docker-compose.dev.yml down
echo.

:: Abrir navegador
echo Abriendo navegador...
start http://localhost:3000

echo.
echo Presiona cualquier tecla para continuar...
pause >nul
goto :end

:error
echo.
echo La instalacion fallo. Revisa los errores arriba.
echo.
pause
exit /b 1

:end
echo.
echo Disfruta usando SIGESA!
exit /b 0