#!/bin/bash

echo ""
echo "========================================"
echo " 🎓 SIGESA - Instalación Automática"
echo "========================================"
echo ""

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker no está instalado"
    echo ""
    echo "Por favor instala Docker desde:"
    echo "https://docs.docker.com/get-docker/"
    exit 1
fi

echo "✅ Docker está instalado"

# Verificar si Docker está corriendo
if ! docker info &> /dev/null; then
    echo "❌ Error: Docker no está corriendo"
    echo ""
    echo "Por favor inicia Docker e intenta de nuevo"
    exit 1
fi

echo "✅ Docker está corriendo"

# Verificar si existe el archivo .env
if [ ! -f ".env" ]; then
    echo ""
    echo "📋 Creando archivo de configuración..."
    if [ -f ".env.example" ]; then
        cp ".env.example" ".env"
        echo "✅ Archivo .env creado desde .env.example"
    else
        echo "❌ Error: No se encontró .env.example"
        echo "Por favor crea el archivo .env manualmente"
        exit 1
    fi
else
    echo "✅ Archivo .env ya existe"
fi

echo ""
echo "🚀 Iniciando servicios de SIGESA..."
echo ""

# Iniciar servicios con docker-compose
if ! docker-compose -f docker-compose.dev.yml up -d; then
    echo ""
    echo "❌ Error al iniciar los servicios"
    echo "Revisa los logs con: docker-compose -f docker-compose.dev.yml logs"
    exit 1
fi

echo ""
echo "⏳ Esperando que los servicios estén listos..."
sleep 30

echo ""
echo "🗄️ Configurando base de datos..."

# Generar clave de aplicación si no existe
if ! grep -q "APP_KEY=base64:" .env; then
    echo "🔑 Generando clave de aplicación..."
    docker exec sigesa_backend php artisan key:generate --force
fi

# Ejecutar migraciones
echo "📊 Ejecutando migraciones..."
if ! docker exec sigesa_backend php artisan migrate --force; then
    echo ""
    echo "⚠️  Error en migraciones, pero continuando..."
fi

# Ejecutar seeders
echo "🌱 Poblando base de datos con datos iniciales..."
if ! docker exec sigesa_backend php artisan db:seed --force; then
    echo ""
    echo "⚠️  Error en seeders, pero continuando..."
fi

echo ""
echo "✅ INSTALACIÓN COMPLETADA"
echo ""
echo "========================================"
echo " 🌐 ACCESO A LA APLICACIÓN"
echo "========================================"
echo ""
echo "Frontend (React):     http://localhost:3000"
echo "Backend API:          http://localhost:8000"
echo "API Documentation:    http://localhost:8000/api/documentation"
echo ""
echo "========================================"
echo " 🛠️  COMANDOS ÚTILES"
echo "========================================"
echo ""
echo "Ver estado:           docker ps"
echo "Parar servicios:     docker-compose -f docker-compose.dev.yml down"
echo "Ver logs backend:     docker logs sigesa_backend"
echo "Ver logs frontend:    docker logs sigesa_frontend-1"
echo ""
echo "¡Disfruta usando SIGESA! 🎉"