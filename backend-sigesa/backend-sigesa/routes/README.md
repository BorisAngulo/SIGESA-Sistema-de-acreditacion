# Organización de Rutas API - SIGESA

## Estructura de Archivos

La API de SIGESA está organizada en módulos temáticos para facilitar el mantenimiento y la escalabilidad:

```
routes/
├── api.php                 # Archivo principal que carga todos los módulos
├── api/
    ├── instituciones.php   # Rutas de facultades y carreras
    ├── modalidades.php     # Rutas de modalidades y acreditación
    ├── procesos.php        # Rutas de fases y subfases
    └── utilidades.php      # Rutas de documentación y utilidades
```

## Módulos de la API

### 📚 Instituciones (`/api/instituciones.php`)
Gestión de la estructura institucional:

**Recursos principales:**
- `GET|POST /api/facultades` - Gestión de facultades
- `GET|POST /api/carreras` - Gestión de carreras

**Rutas específicas:**
- `GET /api/facultades/{id}/carreras` - Carreras de una facultad
- `GET /api/carreras/buscar/{termino}` - Búsqueda de carreras

### 🎓 Modalidades (`/api/modalidades.php`)
Gestión de modalidades de estudio y acreditación:

**Recursos principales:**
- `GET|POST /api/modalidades` - Gestión de modalidades
- `GET|POST /api/acreditacion-carreras` - Relación carrera-modalidad

**Rutas específicas:**
- `GET /api/carreras/{id}/modalidades` - Modalidades de una carrera
- `GET /api/modalidades/{id}/carreras` - Carreras con una modalidad
- `GET /api/carreras/{carrera}/modalidades/{modalidad}/verificar` - Verificar asociación

### ⚙️ Procesos (`/api/procesos.php`)
Gestión del proceso de acreditación:

**Recursos principales:**
- `GET|POST /api/fases` - Gestión de fases
- `GET|POST /api/subfases` - Gestión de subfases

**Rutas específicas:**
- `GET /api/fases/{id}/subfases` - Subfases de una fase
- `GET /api/fases/activas` - Fases activas
- `PATCH /api/fases/{id}/completar` - Marcar fase como completada
- `PATCH /api/subfases/{id}/completar` - Marcar subfase como completada

### 🔧 Utilidades (`/api/utilidades.php`)
Herramientas y documentación:

**Rutas disponibles:**
- `GET /api/health` - Estado del sistema
- `GET /api/config` - Configuraciones públicas
- `GET /api/validate-token` - Validar token de autenticación (requiere auth)

## Endpoints Principales

### Información de la API
- `GET /api/` - Información general y endpoints disponibles

### Autenticación
- `GET /api/user` - Información del usuario autenticado (requiere auth)

## Estructura de Respuesta Estándar

Todas las respuestas de la API siguen esta estructura:

```json
{
    "exito": true|false,
    "estado": 200,
    "datos": {
        // contenido de la respuesta
    },
    "error": "mensaje de error" // solo si exito = false
}
```

## Notas para Desarrolladores

1. **Agregar nuevas rutas:** Coloca las rutas en el módulo temático correspondiente.

2. **Crear nuevos módulos:** 
   - Crea un nuevo archivo en `routes/api/`
   - Inclúyelo en `routes/api.php` con `require __DIR__.'/api/nuevo-modulo.php';`

3. **Rutas específicas:** Las rutas personalizadas (no CRUD) deben tener nombres descriptivos y documentación clara.

4. **Middlewares:** Aplica middlewares específicos en cada módulo según sea necesario.

5. **Versionado:** Para futuras versiones, considera crear subdirectorios como `routes/api/v1/` y `routes/api/v2/`.

## Comandos Útiles

```bash
# Ver todas las rutas
php artisan route:list

# Ver rutas de la API específicamente
php artisan route:list --path=api

# Limpiar caché de rutas
php artisan route:clear
```
