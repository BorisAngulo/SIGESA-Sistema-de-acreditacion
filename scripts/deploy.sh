#!/bin/bash

# Script de deployment para SIGESA
# Uso: ./scripts/deploy.sh [desarrollo|produccion]

set -e

ENVIRONMENT=${1:-desarrollo}
PROJECT_NAME="sigesa"

echo "🚀 Iniciando deployment de SIGESA - Ambiente: $ENVIRONMENT"

# Validar que existe el archivo .env
if [ ! -f .env ]; then
    echo "❌ Archivo .env no encontrado. Copiando desde .env.docker.example..."
    cp .env.docker.example .env
    echo "⚠️  IMPORTANTE: Edita el archivo .env con tus configuraciones antes de continuar."
    echo "   Especialmente: APP_KEY, DB_PASSWORD, REDIS_PASSWORD"
    exit 1
fi

# Función para deployment de desarrollo
deploy_development() {
    echo "🔧 Configurando ambiente de desarrollo..."
    
    # Detener servicios existentes
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml down
    
    # Construir imágenes
    echo "🏗️ Construyendo imágenes..."
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml build --no-cache
    
    # Iniciar servicios
    echo "🚀 Iniciando servicios..."
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
    
    # Esperar a que los servicios estén listos
    echo "⏳ Esperando a que los servicios estén listos..."
    sleep 30
    
    # Ejecutar migraciones y seeders
    echo "🔄 Ejecutando migraciones y seeders..."
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml exec backend php artisan migrate:fresh --seed
    
    # Mostrar estado de los servicios
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml ps
    
    echo "✅ Deployment de desarrollo completado!"
    echo "📱 Frontend: http://localhost:3000"
    echo "🔌 Backend API: http://localhost:8000/api"
    echo "🐘 PostgreSQL: localhost:5433"
}

# Función para deployment de producción
deploy_production() {
    echo "🏭 Configurando ambiente de producción..."
    
    # Verificar configuraciones críticas
    if grep -q "password123\|tu_clave_aqui" .env; then
        echo "❌ PELIGRO: Detectadas configuraciones de desarrollo en .env"
        echo "   Actualiza las passwords antes de deployment de producción"
        exit 1
    fi
    
    # Crear backup de la base de datos si existe
    if docker ps | grep -q "${PROJECT_NAME}_postgres"; then
        echo "💾 Creando backup de la base de datos..."
        docker-compose exec postgres pg_dump -U ${DB_USERNAME:-sigesa_user} ${DB_DATABASE:-sigesa_db} > backup_$(date +%Y%m%d_%H%M%S).sql
    fi
    
    # Detener servicios existentes
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml down
    
    # Construir imágenes para producción
    echo "🏗️ Construyendo imágenes para producción..."
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml build --no-cache
    
    # Iniciar servicios
    echo "🚀 Iniciando servicios de producción..."
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
    
    # Esperar a que los servicios estén listos
    echo "⏳ Esperando a que los servicios estén listos..."
    sleep 45
    
    # Ejecutar migraciones (sin seeders en producción)
    echo "🔄 Ejecutando migraciones..."
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml exec backend php artisan migrate --force
    
    # Optimizar Laravel para producción
    echo "⚡ Optimizando Laravel para producción..."
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml exec backend php artisan config:cache
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml exec backend php artisan route:cache
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml exec backend php artisan view:cache
    
    # Mostrar estado de los servicios
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml ps
    
    echo "✅ Deployment de producción completado!"
    echo "🌐 Aplicación: http://localhost"
    echo "📊 Estado de servicios arriba ⬆️"
}

# Ejecutar deployment según el ambiente
case $ENVIRONMENT in
    "desarrollo"|"dev"|"development")
        deploy_development
        ;;
    "produccion"|"prod"|"production")
        deploy_production
        ;;
    *)
        echo "❌ Ambiente no válido: $ENVIRONMENT"
        echo "Uso: $0 [desarrollo|produccion]"
        exit 1
        ;;
esac

echo "🎉 ¡Deployment completado exitosamente!"