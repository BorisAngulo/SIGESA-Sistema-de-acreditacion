# 🎓 SIGESA - Sistema de Gestión de Acreditación

Sistema web para la gestión de procesos de acreditación universitaria desarrollado con Laravel (Backend) y React (Frontend), completamente dockerizado.

## 📋 Requisitos Previos

- **Docker Desktop** (versión 20.10 o superior)
- **Git** (para clonar el repositorio)
- **8 GB de RAM** mínimo recomendado
- **5 GB de espacio libre** en disco

⏱️ **Tiempo estimado de instalación: 25-45 minutos** - [Ver línea de tiempo detallada](TIMELINE.md)

## 🚀 Instalación Rápida

### 1. Clonar el repositorio

```bash
git clone https://github.com/BorisAngulo/SIGESA-Sistema-de-acreditacion.git
cd SIGESA-Sistema-de-acreditacion
```

### 2. Configurar variables de entorno

```bash
# En Windows
copy .env.example .env

# En Linux/Mac
cp .env.example .env
```

### 3. Iniciar los servicios

```bash
# Para desarrollo
docker-compose -f docker-compose.dev.yml up -d

# Para producción
docker-compose -f docker-compose.prod.yml up -d
```

### 4. Configurar la base de datos

```bash
# Ejecutar migraciones
docker exec sigesa_backend php artisan migrate

# Poblar datos iniciales
docker exec sigesa_backend php artisan db:seed

# Generar clave de aplicación (si es necesario)
docker exec sigesa_backend php artisan key:generate
```

## 🌐 Acceso a la Aplicación

Una vez iniciados todos los servicios:

- **Frontend (React)**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/api/documentation
- **Database**: localhost:5433 (PostgreSQL)
- **Redis**: localhost:6379

## 📦 Servicios Incluidos

| Servicio | Tecnología | Puerto | Descripción |
|----------|------------|--------|-------------|
| Frontend | React 18 | 3000 | Interfaz de usuario |
| Backend | Laravel 10 + PHP 8.2 | 8000 | API REST |
| Database | PostgreSQL 15 | 5433 | Base de datos principal |
| Cache | Redis 7 | 6379 | Caché y sesiones |

## 🛠️ Comandos Útiles

### Gestión de Contenedores

```bash
# Ver estado de servicios
docker ps

# Ver logs
docker logs sigesa_backend
docker logs sigesa_frontend-1
docker logs sigesa_postgres
docker logs sigesa_redis

# Parar servicios
docker-compose -f docker-compose.dev.yml down

# Reconstruir servicios
docker-compose -f docker-compose.dev.yml up -d --build
```

### Comandos de Laravel

```bash
# Acceder al contenedor backend
docker exec -it sigesa_backend bash

# Ejecutar migraciones
docker exec sigesa_backend php artisan migrate

# Limpiar caché
docker exec sigesa_backend php artisan cache:clear
docker exec sigesa_backend php artisan config:clear
docker exec sigesa_backend php artisan route:clear

# Crear usuario administrador
docker exec sigesa_backend php artisan make:user admin@umss.edu.bo
```

### Base de Datos

```bash
# Acceder a PostgreSQL
docker exec -it sigesa_postgres psql -U sigesa_dev -d sigesa_dev

# Backup de la base de datos
docker exec sigesa_postgres pg_dump -U sigesa_dev sigesa_dev > backup.sql

# Restaurar backup
docker exec -i sigesa_postgres psql -U sigesa_dev -d sigesa_dev < backup.sql
```

## 🔧 Configuración Personalizada

### Variables de Entorno Principales

Edita el archivo `.env` para personalizar:

```env
# Aplicación
APP_NAME="SIGESA"
APP_URL=http://localhost

# Base de Datos
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=sigesa_dev
DB_USERNAME=sigesa_dev
DB_PASSWORD=password123

# Redis
REDIS_HOST=redis
REDIS_PASSWORD=""

# Correo (opcional)
MAIL_MAILER=smtp
MAIL_HOST=
MAIL_PORT=587
MAIL_USERNAME=
MAIL_PASSWORD=
```

### Puertos Personalizados

Modifica los puertos en `docker-compose.dev.yml`:

```yaml
ports:
  - "3001:3000"  # Frontend en puerto 3001
  - "8001:9000"  # Backend en puerto 8001
  - "5434:5432"  # PostgreSQL en puerto 5434
```

## 🏗️ Entornos de Deployment

### Desarrollo (`docker-compose.dev.yml`)
- Hot reload para desarrollo
- Debugging habilitado
- Volúmenes montados para cambios en tiempo real
- Seeders ejecutados automáticamente

### Producción (`docker-compose.prod.yml`)
- Imágenes optimizadas
- Sin herramientas de desarrollo
- Variables de seguridad configuradas
- Nginx como proxy reverso

## 🚨 Solución de Problemas

### Error: "docker-compose not found"
```bash
# Usar docker compose (sin guión)
docker compose -f docker-compose.dev.yml up -d
```

### Error: "Port already in use"
```bash
# Verificar puertos ocupados
netstat -tlnp | grep :3000

# Cambiar puertos en docker-compose.yml
```

### Error: "Container keeps restarting"
```bash
# Ver logs detallados
docker logs sigesa_backend --tail 50

# Verificar configuración
docker exec sigesa_backend env | grep DB_
```

### Error de conexión a base de datos
```bash
# Verificar que PostgreSQL esté healthy
docker ps

# Reiniciar servicios en orden
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up -d postgres redis
# Esperar 30 segundos
docker-compose -f docker-compose.dev.yml up -d backend frontend
```

## 📚 Documentación Adicional

- ⚡ [Instalación Rápida](QUICK-INSTALL.md) - Resumen visual del proceso
- ⏱️ [Línea de Tiempo](TIMELINE.md) - Cronograma detallado de instalación
- 📋 [Lista de Verificación](CHECKLIST.md) - Checklist para distribución
- [Manual de Usuario](docs/manual-usuario.md)
- [API Documentation](docs/api.md)
- [Guía de Desarrollo](docs/desarrollo.md)
- [Configuración de Producción](docs/produccion.md)

## 🤝 Contribuir

1. Fork el repositorio
2. Crear rama feature (`git checkout -b feature/nueva-caracteristica`)
3. Commit cambios (`git commit -am 'Añadir nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver [LICENSE](LICENSE) para detalles.

## 👥 Equipo de Desarrollo

- **Desarrollo**: Equipo UMSS
- **Contacto**: sistemas@umss.edu.bo

## 🔄 Changelog

### v1.0.0 (2025-10-01)
- ✅ Dockerización completa del sistema
- ✅ Configuración de desarrollo y producción
- ✅ Base de datos PostgreSQL con seeders
- ✅ API REST completa con documentación
- ✅ Frontend React con interfaz moderna
- ✅ Sistema de autenticación y roles
- ✅ Gestión de facultades, carreras y modalidades
- ✅ Análisis FODA y matrices PLAME
- ✅ Sistema de documentos y archivos

---

**¿Necesitas ayuda?** Crea un [issue](https://github.com/BorisAngulo/SIGESA-Sistema-de-acreditacion/issues) en GitHub.