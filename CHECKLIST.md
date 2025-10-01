# 📋 Lista de Verificación para Distribución - SIGESA

## ✅ Archivos Principales Incluidos

### Configuración Docker
- [x] `docker-compose.yml` - Configuración base
- [x] `docker-compose.dev.yml` - Configuración de desarrollo  
- [x] `docker-compose.prod.yml` - Configuración de producción
- [x] `.env.example` - Plantilla de variables de entorno

### Scripts de Instalación
- [x] `install.bat` - Script de instalación para Windows
- [x] `install.sh` - Script de instalación para Linux/Mac
- [x] `README.md` - Documentación completa

### Código Fuente
- [x] `backend-sigesa/` - Código del backend Laravel
- [x] `frontend-sigesa/` - Código del frontend React
- [x] `docker/` - Configuraciones de Docker adicionales
- [x] `scripts/` - Scripts de utilidad

## 📦 Archivos Docker Necesarios

### Backend
- [x] `backend-sigesa/backend-sigesa/Dockerfile`
- [x] `backend-sigesa/backend-sigesa/docker/`
  - [x] `start.sh` - Script de inicio
  - [x] `supervisord.conf` - Configuración de Supervisor
  - [x] `php-fpm.conf` - Configuración de PHP-FPM
  - [x] `php.ini` - Configuración de PHP

### Frontend
- [x] `frontend-sigesa/frontend-sigesa/Dockerfile`
- [x] `frontend-sigesa/frontend-sigesa/Dockerfile.dev`

## 🔧 Configuraciones Necesarias

### Variables de Entorno
- [x] APP_KEY será generado automáticamente
- [x] Configuración de base de datos
- [x] Configuración de Redis
- [x] Configuración de correo (opcional)

### Puertos por Defecto
- Frontend: 3000
- Backend: 8000  
- PostgreSQL: 5433
- Redis: 6379

## 📋 Instrucciones para Nuevo Equipo

### Requisitos Previos
1. **Docker Desktop** instalado y funcionando
2. **Git** para clonar el repositorio
3. **8GB RAM** mínimo recomendado
4. **5GB espacio libre** en disco

### Pasos de Instalación

#### Opción 1: Script Automático (Recomendado)
```bash
# 1. Clonar repositorio
git clone https://github.com/BorisAngulo/SIGESA-Sistema-de-acreditacion.git
cd SIGESA-Sistema-de-acreditacion

# 2. Ejecutar script de instalación
# Windows:
.\install.bat

# Linux/Mac:
chmod +x install.sh
./install.sh
```

#### Opción 2: Manual
```bash
# 1. Clonar repositorio
git clone https://github.com/BorisAngulo/SIGESA-Sistema-de-acreditacion.git
cd SIGESA-Sistema-de-acreditacion

# 2. Configurar entorno
cp .env.example .env

# 3. Iniciar servicios
docker-compose -f docker-compose.dev.yml up -d

# 4. Configurar base de datos
docker exec sigesa_backend php artisan migrate --force
docker exec sigesa_backend php artisan db:seed --force
```

## 🌐 URLs de Acceso
Una vez instalado, el sistema estará disponible en:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000  
- **API Docs**: http://localhost:8000/api/documentation

## 🛠️ Comandos Útiles

### Gestión de Servicios
```bash
# Ver estado
docker ps

# Parar servicios  
docker-compose -f docker-compose.dev.yml down

# Ver logs
docker logs sigesa_backend
docker logs sigesa_frontend-1

# Reiniciar servicios
docker-compose -f docker-compose.dev.yml restart
```

### Base de Datos
```bash
# Ejecutar migraciones
docker exec sigesa_backend php artisan migrate

# Poblar datos iniciales
docker exec sigesa_backend php artisan db:seed

# Acceder a PostgreSQL
docker exec -it sigesa_postgres psql -U sigesa_dev -d sigesa_dev
```

## 🚨 Solución de Problemas Comunes

### Docker no funciona
- Verificar que Docker Desktop esté instalado e iniciado
- En Windows, verificar que la virtualización esté habilitada

### Error de puertos ocupados  
- Cambiar puertos en docker-compose.dev.yml
- Verificar con: `netstat -an | findstr :3000`

### Error de permisos
- En Linux/Mac: `sudo chmod +x install.sh`
- Ejecutar como administrador en Windows si es necesario

### Contenedores no inician
- Verificar logs: `docker logs <container_name>`
- Verificar que haya suficiente espacio en disco
- Reiniciar Docker Desktop

## ✅ Lista de Verificación Final

Antes de distribuir, verificar que:

- [ ] Todos los archivos están en el repositorio
- [ ] Los scripts de instalación funcionan
- [ ] El README.md está actualizado
- [ ] Los archivos .env.example están configurados
- [ ] Los Dockerfiles están optimizados
- [ ] La documentación está completa
- [ ] Se han probado los scripts en un equipo limpio

## 📞 Soporte

Si hay problemas durante la instalación:

1. Revisar este archivo de verificación
2. Consultar el README.md
3. Crear un issue en GitHub con detalles del error
4. Contactar al equipo de desarrollo

---

**Fecha de última actualización**: 1 de octubre de 2025
**Versión**: 1.0.0