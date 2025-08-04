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

// Obtener una acreditación específica (público)
Route::get('acreditacion-carreras/{acreditacion_carrera}', [CarreraModalidadController::class, 'show'])
    ->name('acreditacion-carreras.show');

// Obtener modalidades disponibles para una carrera (público)
Route::get('carreras/{carrera}/modalidades', [CarreraModalidadController::class, 'getModalidadesByCarrera'])
    ->name('carreras.modalidades');

// Obtener carreras que tienen una modalidad específica (público)
Route::get('modalidades/{modalidad}/carreras', [CarreraModalidadController::class, 'getCarrerasByModalidad'])
    ->name('modalidades.carreras');

// Verificar si una carrera tiene una modalidad específica (público)
Route::get('carreras/{carrera}/modalidades/{modalidad}/verificar', [CarreraModalidadController::class, 'verificarAsociacion'])
    ->name('carreras.modalidades.verificar');

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
    
    // Eliminar acreditación
    Route::delete('acreditacion-carreras/{acreditacion_carrera}', [CarreraModalidadController::class, 'destroy'])
        ->name('acreditacion-carreras.destroy');
});
