<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ModalidadController;
use App\Http\Controllers\Api\CarreraModalidadController;

/*
|--------------------------------------------------------------------------
| Rutas de Modalidades
|--------------------------------------------------------------------------
|
| Rutas relacionadas con la gestión de modalidades de estudio
| y la relación carrera-modalidad para acreditación
|
*/

// === RUTAS PÚBLICAS (SOLO LECTURA) ===
// Consultas que no requieren autenticación para mostrar datos básicos

// Obtener todas las modalidades (público)
Route::get('modalidades', [ModalidadController::class, 'index'])
    ->name('modalidades.index');

// Obtener una modalidad específica (público)
Route::get('modalidades/{modalidad}', [ModalidadController::class, 'show'])
    ->name('modalidades.show');

// Obtener todas las acreditaciones carrera-modalidad (público)
Route::get('acreditacion-carreras', [CarreraModalidadController::class, 'index'])
    ->name('acreditacion-carreras.index');

// Obtener carreras-modalidad con parámetros opcionales (público)
Route::get('carrera-modalidad', [CarreraModalidadController::class, 'index'])
    ->name('carrera-modalidad.index');

// Obtener una acreditación específica (público)
Route::get('acreditacion-carreras/{acreditacion_carrera}', [CarreraModalidadController::class, 'show'])
    ->name('acreditacion-carreras.show');

// Buscar carrera-modalidad activa dentro del rango de fechas actual (público)
Route::get('carrera-modalidad/buscar-activa/{carrera_id}/{modalidad_id}', [CarreraModalidadController::class, 'buscarActiva'])
    ->name('carrera-modalidad.buscar-activa');

// Obtener modalidades disponibles para una carrera (público)
Route::get('carreras/{carrera}/modalidades', [CarreraModalidadController::class, 'getModalidadesByCarrera'])
    ->name('carreras.modalidades');

// Obtener carreras que tienen una modalidad específica (público)
Route::get('modalidades/{modalidad}/carreras', [CarreraModalidadController::class, 'getCarrerasByModalidad'])
    ->name('modalidades.carreras');

// Verificar si una carrera tiene una modalidad específica (público)
Route::get('carreras/{carrera}/modalidades/{modalidad}/verificar', [CarreraModalidadController::class, 'verificarAsociacion'])
    ->name('carreras.modalidades.verificar');

// Obtener historial completo de acreditaciones de una carrera con estado actual
Route::get('carreras/{carrera}/historial-acreditaciones', [CarreraModalidadController::class, 'getHistorialAcreditaciones'])
    ->name('carreras.historial-acreditaciones');

// Obtener historial de acreditaciones filtrado por modalidad específica
Route::get('carreras/{carrera}/historial-acreditaciones/{modalidad}', [CarreraModalidadController::class, 'getHistorialAcreditacionesPorModalidad'])
    ->name('carreras.historial-acreditaciones.modalidad');

// Obtener todas las carreras-modalidades con detalles completos (facultad, carrera, fases, subfases)
Route::get('carrera-modalidad/detalles-completos', [CarreraModalidadController::class, 'getDetallesCompletos'])
    ->name('carrera-modalidad.detalles-completos');

// Obtener proceso completo: carrera-modalidad con todas sus fases y subfases (ENDPOINT CONSOLIDADO)
Route::get('acreditacion-carreras/{acreditacion_carrera}/proceso-completo', [CarreraModalidadController::class, 'getProcesoCompleto'])
    ->name('acreditacion-carreras.proceso-completo');

// Obtener o crear proceso activo con validaciones consolidadas (ENDPOINT CONSOLIDADO)
Route::post('acreditacion-carreras/obtener-crear-proceso-activo', [CarreraModalidadController::class, 'obtenerOCrearProcesoActivo'])
    ->middleware('auth:sanctum')
    ->name('acreditacion-carreras.obtener-crear-proceso-activo');

// Descargar certificado de acreditación (público)
Route::get('acreditacion-carreras/{acreditacion_carrera}/certificado/descargar', [CarreraModalidadController::class, 'descargarCertificado'])
    ->name('acreditacion-carreras.certificado.descargar');

// === RUTAS PROTEGIDAS (REQUIEREN AUTENTICACIÓN) ===
// Operaciones de escritura que requieren usuario autenticado
Route::middleware(['auth:sanctum'])->group(function () {
    // === MODALIDADES ===
    // Crear modalidad
    Route::post('modalidades', [ModalidadController::class, 'store'])
        ->name('modalidades.store');
    
    // Actualizar modalidad
    Route::put('modalidades/{modalidad}', [ModalidadController::class, 'update'])
        ->name('modalidades.update');
    Route::patch('modalidades/{modalidad}', [ModalidadController::class, 'update'])
        ->name('modalidades.patch');
    
    // Eliminar modalidad
    Route::delete('modalidades/{modalidad}', [ModalidadController::class, 'destroy'])
        ->name('modalidades.destroy');

    // === ACREDITACIÓN CARRERA-MODALIDAD ===
    // Crear acreditación
    Route::post('acreditacion-carreras', [CarreraModalidadController::class, 'store'])
        ->name('acreditacion-carreras.store');
    
    // Actualizar acreditación
    Route::put('acreditacion-carreras/{acreditacion_carrera}', [CarreraModalidadController::class, 'update'])
        ->name('acreditacion-carreras.update');
    Route::patch('acreditacion-carreras/{acreditacion_carrera}', [CarreraModalidadController::class, 'update'])
        ->name('acreditacion-carreras.patch');
    
    // Actualizar acreditación (POST con _method=PUT para FormData)
    Route::post('acreditacion-carreras/{acreditacion_carrera}', [CarreraModalidadController::class, 'update'])
        ->name('acreditacion-carreras.update-post');
    
    // Actualizar fechas del proceso de acreditación
    Route::put('acreditacion-carreras/{acreditacion_carrera}/fechas-proceso', [CarreraModalidadController::class, 'updateFechasProceso'])
        ->name('acreditacion-carreras.update-fechas-proceso');
    Route::post('acreditacion-carreras/{acreditacion_carrera}/fechas-proceso', [CarreraModalidadController::class, 'updateFechasProceso'])
        ->name('acreditacion-carreras.update-fechas-proceso-post');
    
    // Eliminar acreditación
    Route::delete('acreditacion-carreras/{acreditacion_carrera}', [CarreraModalidadController::class, 'destroy'])
        ->name('acreditacion-carreras.destroy');
});
