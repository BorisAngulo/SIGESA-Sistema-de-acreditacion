# Dockerfile para Backend Laravel - SIGESA
FROM php:8.2-fpm

# Metadatos
LABEL maintainer="SIGESA Team"
LABEL description="Backend Laravel para Sistema de Gestión de Acreditación"

# Instalar dependencias del sistema y extensiones PHP necesarias
RUN apt-get update && apt-get install -y \
    # Dependencias básicas
    build-essential \
    libpng-dev \
    libjpeg62-turbo-dev \
    libfreetype6-dev \
    locales \
    zip \
    jpegoptim optipng pngquant gifsicle \
    vim \
    unzip \
    git \
    curl \
    libzip-dev \
    libonig-dev \
    libxml2-dev \
    # Dependencias para PostgreSQL
    libpq-dev \
    # Dependencias para GD
    libgd-dev \
    # Herramientas adicionales
    supervisor \
    && rm -rf /var/lib/apt/lists/*

# Configurar e instalar extensiones PHP
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        pdo \
        pdo_pgsql \
        pgsql \
        mbstring \
        zip \
        exif \
        pcntl \
        gd \
        xml \
        bcmath

# Instalar Redis extension
RUN pecl install redis && docker-php-ext-enable redis

# Instalar Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Crear usuario no-root para Laravel
RUN groupadd -g 1000 www && useradd -u 1000 -ms /bin/bash -g www www

# Establecer directorio de trabajo
WORKDIR /var/www

# Copiar archivos de dependencias primero (para cache de Docker)
COPY --chown=www:www composer.json composer.lock ./

# Instalar dependencias PHP (con dev dependencies para desarrollo)
ARG APP_ENV=production
RUN if [ "$APP_ENV" = "local" ] || [ "$APP_ENV" = "development" ]; then \
        composer install --optimize-autoloader --no-scripts --no-interaction; \
    else \
        composer install --no-dev --optimize-autoloader --no-scripts --no-interaction; \
    fi

# Copiar el resto del código de la aplicación
COPY --chown=www:www . .

# Ejecutar scripts post-instalación de Composer
RUN composer run-script post-autoload-dump

# Configurar permisos para Laravel
RUN chown -R www:www /var/www \
    && chmod -R 755 /var/www \
    && chmod -R 775 /var/www/storage \
    && chmod -R 775 /var/www/bootstrap/cache

# Crear directorio para logs de supervisord
RUN mkdir -p /var/log/supervisor

# Configurar supervisord para PHP-FPM
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Configurar PHP-FPM
COPY docker/php-fpm.conf /usr/local/etc/php-fpm.d/www.conf

# Configurar PHP
COPY docker/php.ini /usr/local/etc/php/conf.d/custom.ini

# Script de inicialización
COPY docker/start.sh /usr/local/bin/start.sh
RUN chmod +x /usr/local/bin/start.sh

# Cambiar al usuario www
USER www

# Exponer puerto 9000 para PHP-FPM
EXPOSE 9000

# Comando por defecto
CMD ["/usr/local/bin/start.sh"]