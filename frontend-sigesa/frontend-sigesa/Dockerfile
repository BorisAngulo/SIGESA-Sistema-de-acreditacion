# Dockerfile Multi-stage para Frontend React - SIGESA
# Etapa 1: Build de la aplicación React
FROM node:18-alpine AS builder

# Metadatos
LABEL maintainer="SIGESA Team"
LABEL description="Frontend React para Sistema de Gestión de Acreditación"

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Build de la aplicación React para producción
RUN npm run build

# Etapa 2: Servir con Nginx
FROM nginx:alpine

# Instalar curl para healthchecks
RUN apk add --no-cache curl

# Remover configuración por defecto de nginx
RUN rm -rf /usr/share/nginx/html/*

# Copiar archivos build desde la etapa anterior
COPY --from=builder /app/build /usr/share/nginx/html

# Copiar configuración personalizada de nginx
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/default.conf /etc/nginx/conf.d/default.conf

# Crear usuario no-root para nginx
RUN addgroup -g 1001 -S nginx && \
    adduser -S -D -H -u 1001 -h /var/cache/nginx -s /sbin/nologin -G nginx -g nginx nginx

# Configurar permisos
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

# Cambiar al usuario nginx
USER nginx

# Exponer puerto 80
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# Comando por defecto
CMD ["nginx", "-g", "daemon off;"]