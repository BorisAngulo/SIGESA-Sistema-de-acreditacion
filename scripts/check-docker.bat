@echo off
echo 🐳 Verificando instalación de Docker...
echo.

echo Verificando Docker Engine...
docker --version
if errorlevel 1 (
    echo ❌ Docker no está instalado o no está en el PATH
    echo.
    echo 📥 Descargar Docker Desktop desde:
    echo https://www.docker.com/products/docker-desktop/
    echo.
    pause
    exit /b 1
)

echo.
echo Verificando Docker Compose...
docker compose version
if errorlevel 1 (
    echo ⚠️ Intentando con docker-compose legacy...
    docker-compose --version
    if errorlevel 1 (
        echo ❌ Docker Compose no disponible
        pause
        exit /b 1
    ) else (
        echo ✅ Docker Compose legacy encontrado
    )
) else (
    echo ✅ Docker Compose moderno encontrado
)

echo.
echo Verificando que Docker esté corriendo...
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker no está corriendo
    echo 💡 Inicia Docker Desktop desde el menú de inicio
    pause
    exit /b 1
) else (
    echo ✅ Docker está corriendo correctamente
)

echo.
echo 🎉 ¡Docker está listo para usar!
echo.
pause