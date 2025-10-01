#!/bin/bash

# Script de inicialización para el contenedor Laravel

echo "🚀 Iniciando contenedor Laravel para SIGESA..."

# Esperar a que PostgreSQL esté disponible
echo "⏳ Esperando a PostgreSQL..."
while ! pg_isready -h postgres -p 5432 -U ${DB_USERNAME:-sigesa_user} > /dev/null 2>&1; do
  echo "⏳ PostgreSQL no está listo, esperando 2 segundos..."
  sleep 2
done
echo "✅ PostgreSQL está disponible!"

# Ejecutar migraciones si es necesario
if [ "${APP_ENV}" = "production" ] || [ "${RUN_MIGRATIONS}" = "true" ]; then
    echo "🔄 Ejecutando migraciones de base de datos..."
    php artisan migrate --force
    
    # Ejecutar seeders solo si se especifica
    if [ "${RUN_SEEDERS}" = "true" ]; then
        echo "🌱 Ejecutando seeders..."
        php artisan db:seed --force
    fi
fi

# Generar clave de aplicación si no existe
if [ -z "${APP_KEY}" ]; then
    echo "🔑 Generando clave de aplicación..."
    php artisan key:generate --force
fi

# Limpiar y optimizar cache para producción
if [ "${APP_ENV}" = "production" ]; then
    echo "🔧 Optimizando para producción..."
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
fi

# Crear enlace simbólico para storage si no existe
if [ ! -L public/storage ]; then
    echo "🔗 Creando enlace simbólico para storage..."
    php artisan storage:link
fi

echo "✅ Inicialización completada. Iniciando PHP-FPM..."

# Iniciar supervisord (que maneja PHP-FPM)
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf