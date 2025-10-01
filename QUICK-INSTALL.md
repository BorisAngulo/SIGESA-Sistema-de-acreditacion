# ⚡ Instalación Rápida - SIGESA

## 🕒 **Tiempo Total: 25-45 minutos**

```
┌─────────────────────────────────────────────────────────────┐
│                    LÍNEA DE TIEMPO SIGESA                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 0-5 min   │██████│ Preparación y clonado                   │
│           │      │ • Verificar Docker                      │
│           │      │ • Clonar repositorio                    │
│           │      │ • Configurar .env                       │
│                                                             │
│ 5-25 min  │████████████████████████████│ Descarga Docker  │
│           │                            │ • PostgreSQL      │
│           │                            │ • Redis           │
│           │                            │ • PHP 8.2         │
│           │                            │ • Node.js         │
│           │                            │ • Dependencias    │
│                                                             │
│ 25-35 min │████████████│ Base de Datos                     │
│           │            │ • Migraciones (25 tablas)         │
│           │            │ • Seeders (datos UMSS)            │
│           │            │ • Verificación                    │
│                                                             │
│ 35-40 min │██████│ Verificación Final                      │
│           │      │ • Servicios corriendo                   │
│           │      │ • APIs funcionando                      │
│           │      │ • Frontend accesible                    │
│                                                             │
│ 40+ min   │✅│ ¡LISTO PARA USAR!                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 **Proceso Súper Simple**

### 1️⃣ **Clonar** *(2-3 minutos)*
```bash
git clone https://github.com/BorisAngulo/SIGESA-Sistema-de-acreditacion.git
cd SIGESA-Sistema-de-acreditacion
```

### 2️⃣ **Ejecutar** *(1 comando)*

**🔥 MÉTODO MÁS FÁCIL - Doble clic:**
- Encuentra el archivo `setup.bat` en el explorador
- Haz **doble clic** sobre él
- ¡Listo!

**💻 Desde PowerShell:**
```powershell
.\setup.ps1
```

**⚫ Desde CMD (Símbolo del Sistema):**
```cmd
setup.bat
```

**🛠️ Manual (si los scripts fallan):**
```cmd
copy .env.example .env
docker-compose -f docker-compose.dev.yml up -d
docker exec sigesa_backend php artisan migrate --force
docker exec sigesa_backend php artisan db:seed --force
```

### 3️⃣ **Esperar** *(25-40 minutos)*
- El script hace TODO automáticamente
- No requiere intervención manual
- Muestra progreso en tiempo real

### 4️⃣ **¡Usar!** *(Inmediato)*
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- Docs: http://localhost:8000/api/documentation

## 📊 **Tiempos por Tipo de Equipo**

| Tipo de Equipo | Internet | RAM | Tiempo Total |
|----------------|----------|-----|--------------|
| 🏃‍♂️ **Rápido** | >50 Mbps | 16GB+ | **20-25 min** |
| 🚶‍♂️ **Promedio** | 10-50 Mbps | 8-16GB | **30-40 min** |
| 🐌 **Lento** | <10 Mbps | <8GB | **45-60 min** |

## ⚠️ **Si no tienes Docker:**
- **Tiempo adicional: +20-30 minutos**
- Descargar desde: https://www.docker.com/products/docker-desktop/

## 🎯 **¿Qué incluye la instalación automática?**

✅ **4 Servicios Completos:**
- PostgreSQL 15 (Base de datos)
- Redis 7 (Caché y sesiones)  
- Laravel 10 (Backend API)
- React 18 (Frontend)

✅ **Base de Datos Completa:**
- 25 migraciones ejecutadas
- 17 facultades UMSS
- ~50 carreras universitarias
- Sistema de usuarios y roles
- Datos FODA y PLAME

✅ **Sistema Funcionando:**
- API REST completa
- Interfaz web moderna
- Documentación automática
- Autenticación y autorización

## 💡 **Consejos para una instalación rápida:**

1. **Antes de empezar:**
   - Asegúrate de que Docker Desktop esté corriendo
   - Conecta a una red Wi-Fi estable
   - Cierra aplicaciones innecesarias

2. **Durante la instalación:**
   - NO cierres la ventana de terminal
   - Mantén el equipo conectado a la corriente
   - Sé paciente con las descargas

3. **Si algo falla:**
   - Revisa los logs: `docker logs sigesa_backend`
   - Reinicia Docker Desktop
   - Ejecuta de nuevo: `.\install.bat`

## 🆘 **¿Necesitas ayuda?**

- 📖 [Documentación completa](README.md)
- ⏱️ [Línea de tiempo detallada](TIMELINE.md)
- 📋 [Lista de verificación](CHECKLIST.md)
- 🐛 [Reportar problemas](https://github.com/BorisAngulo/SIGESA-Sistema-de-acreditacion/issues)

---

**¡En menos de 45 minutos tendrás el sistema completo de gestión de acreditación UMSS funcionando en tu equipo!** 🎉