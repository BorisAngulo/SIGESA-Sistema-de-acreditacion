# ⏱️ Línea de Tiempo - Instalación SIGESA

## 🚀 **Tiempo Total Estimado: 25-45 minutos**
*(Dependiendo de la velocidad de internet y especificaciones del equipo)*

---

## 📋 **FASE 1: PREPARACIÓN** *(5-10 minutos)*

### ⏰ **Minuto 0-2: Verificación de Requisitos**
- ✅ Verificar que el equipo tenga Docker Desktop instalado
- ✅ Verificar que Docker esté corriendo
- ✅ Verificar conexión a internet estable
- ✅ Verificar espacio libre en disco (mínimo 5GB)

**⚠️ Si Docker no está instalado:**
- **Tiempo adicional: +15-30 minutos** para descargar e instalar Docker Desktop

### ⏰ **Minuto 2-5: Obtener el Código**
```bash
# Clonar repositorio
git clone https://github.com/BorisAngulo/SIGESA-Sistema-de-acreditacion.git
cd SIGESA-Sistema-de-acreditacion
```
**Tiempo estimado:** 1-3 minutos (depende de conexión)

### ⏰ **Minuto 5-8: Configuración Inicial**
```bash
# Opción automática (recomendada)
.\install.bat

# O manual
copy .env.example .env
```
**Tiempo estimado:** 1-2 minutos

---

## 📦 **FASE 2: DESCARGA E INSTALACIÓN** *(10-25 minutos)*

### ⏰ **Minuto 8-20: Descarga de Imágenes Docker**
```bash
docker-compose -f docker-compose.dev.yml up -d
```

**Descargas que se realizan:**
- **PostgreSQL 15-alpine** (~80MB) - 2-4 minutos
- **Redis 7-alpine** (~30MB) - 1-2 minutos  
- **Node.js 18-alpine** (~180MB) - 3-6 minutos
- **PHP 8.2-FPM** (~500MB) - 5-10 minutos
- **Composer dependencies** - 2-4 minutos

**⏱️ Tiempo total de descarga: 10-20 minutos** *(primera vez)*
**⏱️ Tiempo en ejecuciones posteriores: 2-5 minutos** *(imágenes en caché)*

### ⏰ **Minuto 20-30: Construcción de Contenedores**
- **Backend Laravel**: Instalación de dependencias PHP - 3-5 minutos
- **Frontend React**: Instalación de dependencias NPM - 4-8 minutos
- **Configuración de servicios**: 1-2 minutos

---

## 🗄️ **FASE 3: CONFIGURACIÓN DE BASE DE DATOS** *(5-8 minutos)*

### ⏰ **Minuto 30-33: Inicialización de PostgreSQL**
- ✅ Creación de base de datos
- ✅ Configuración de usuario y permisos
- ✅ Verificación de conectividad

### ⏰ **Minuto 33-35: Migraciones**
```bash
docker exec sigesa_backend php artisan migrate
```
- **25 migraciones** ejecutándose secuencialmente
- **Tiempo estimado:** 1-2 minutos

### ⏰ **Minuto 35-38: Población de Datos (Seeders)**
```bash
docker exec sigesa_backend php artisan db:seed
```
- **Facultades UMSS**: 17 facultades
- **Carreras**: ~50 carreras  
- **Modalidades**: Presencial, Semipresencial, Virtual
- **Usuarios y roles del sistema**
- **Datos de configuración FODA y PLAME**

**Tiempo estimado:** 2-3 minutos

---

## ✅ **FASE 4: VERIFICACIÓN FINAL** *(2-5 minutos)*

### ⏰ **Minuto 38-40: Verificación de Servicios**
```bash
docker ps
```
**Verificar que estén corriendo:**
- ✅ sigesa_postgres (healthy)
- ✅ sigesa_redis (healthy)  
- ✅ sigesa_backend (healthy)
- ✅ sigesa_frontend (running)

### ⏰ **Minuto 40-42: Pruebas de Conectividad**
- **Frontend**: http://localhost:3000 ✅
- **Backend API**: http://localhost:8000 ✅
- **Documentación**: http://localhost:8000/api/documentation ✅

### ⏰ **Minuto 42-45: Primer Acceso**
- ✅ Abrir navegador
- ✅ Navegar por la interfaz
- ✅ Verificar que los datos se cargan correctamente

---

## 📊 **RESUMEN POR ESPECIFICACIONES DEL EQUIPO**

### 🏃‍♂️ **Equipo Rápido** *(Internet >50Mbps, SSD, 16GB+ RAM)*
- **Tiempo total: 20-25 minutos**
- **Primera instalación completa**

### 🚶‍♂️ **Equipo Promedio** *(Internet 10-50Mbps, HDD, 8-16GB RAM)*
- **Tiempo total: 30-40 minutos**  
- **Tiempo estándar esperado**

### 🐌 **Equipo Lento** *(Internet <10Mbps, HDD antiguo, <8GB RAM)*
- **Tiempo total: 45-60 minutos**
- **Puede requerir paciencia adicional**

---

## ⚡ **OPTIMIZACIONES PARA INSTALACIONES FUTURAS**

### 🔄 **Segunda Instalación en el Mismo Equipo**
- **Tiempo total: 5-10 minutos**
- Las imágenes Docker ya están descargadas
- Solo se ejecutan migraciones y seeders

### 📦 **Instalación en Red Local**
Si alguien más en la red ya tiene las imágenes:
```bash
# Compartir imágenes Docker
docker save sistemadeacreditacion-backend > sigesa-backend.tar
docker save sistemadeacreditacion-frontend > sigesa-frontend.tar

# En el nuevo equipo
docker load < sigesa-backend.tar
docker load < sigesa-frontend.tar
```
**Tiempo ahorrado: 15-20 minutos en descargas**

---

## 🚨 **POSIBLES DEMORAS Y SOLUCIONES**

### ⚠️ **Docker no instalado** *(+20-40 minutos)*
**Solución:**
1. Descargar Docker Desktop (5-10 min)
2. Instalar Docker Desktop (10-15 min)
3. Reiniciar sistema si es necesario (5-10 min)
4. Configurar Docker (2-5 min)

### ⚠️ **Problemas de conectividad** *(+5-15 minutos)*
**Soluciones:**
- Reiniciar Docker Desktop
- Verificar firewall/antivirus
- Cambiar DNS (8.8.8.8, 1.1.1.1)

### ⚠️ **Puertos ocupados** *(+2-5 minutos)*
**Solución:**
```bash
# Cambiar puertos en docker-compose.dev.yml
ports:
  - "3001:3000"  # Frontend
  - "8001:9000"  # Backend
```

### ⚠️ **Memoria insuficiente** *(Variable)*
**Soluciones:**
- Cerrar aplicaciones innecesarias
- Aumentar memoria virtual
- Configurar Docker con menos memoria

---

## 📋 **CHECKLIST CRONOMETRADO**

### **✅ Antes de empezar** *(2 minutos)*
- [ ] Docker Desktop instalado y corriendo
- [ ] Git instalado
- [ ] 5GB espacio libre verificado
- [ ] Conexión estable a internet

### **✅ Durante la instalación** *(25-40 minutos)*
- [ ] Repositorio clonado (2-3 min)
- [ ] Script ejecutado (2 min)
- [ ] Imágenes descargadas (10-20 min)
- [ ] Contenedores construidos (5-10 min)
- [ ] Base de datos configurada (3-5 min)
- [ ] Servicios verificados (2-3 min)

### **✅ Después de la instalación** *(3-5 minutos)*
- [ ] Todas las URLs accesibles
- [ ] Datos cargando correctamente
- [ ] API respondiendo
- [ ] Sistema funcionando completo

---

## 🎯 **TIEMPO ESTIMADO FINAL**

| Escenario | Tiempo Mínimo | Tiempo Promedio | Tiempo Máximo |
|-----------|---------------|-----------------|---------------|
| **Equipo rápido + Docker instalado** | 20 min | 25 min | 30 min |
| **Equipo promedio + Docker instalado** | 25 min | 35 min | 45 min |
| **Equipo lento + Docker instalado** | 40 min | 50 min | 60 min |
| **Sin Docker instalado** | +20 min | +30 min | +40 min |

---

## 💡 **CONSEJOS PARA OPTIMIZAR EL TIEMPO**

1. **Preparar el entorno previamente**
   - Instalar Docker Desktop con anticipación
   - Verificar conexión estable a internet

2. **Durante la instalación**
   - No cerrar las ventanas de terminal
   - Mantener el equipo conectado a la corriente
   - No ejecutar otros procesos pesados

3. **Monitoreo del progreso**
   ```bash
   # Ver progreso de descarga
   docker-compose -f docker-compose.dev.yml up
   
   # Ver logs en tiempo real
   docker logs -f sigesa_backend
   ```

**¡Con esta línea de tiempo, cualquier persona puede planificar exactamente cuánto tiempo necesitará para tener SIGESA funcionando en su equipo!** ⏰✅