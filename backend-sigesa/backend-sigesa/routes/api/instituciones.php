<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\FacultadController;
use App\Http\Controllers\Api\CarreraController;

/*
|--------------------------------------------------------------------------
| Rutas de Instituciones
|--------------------------------------------------------------------------
|
| Rutas relacionadas con la gestión de facultades y carreras
|
*/

// === RUTAS PÚBLICAS (SOLO LECTURA) ===
// Consultas que no requieren autenticación para mostrar datos básicos

// Obtener todas las facultades (público)
Route::get('facultades', [FacultadController::class, 'index'])
    ->name('facultades.index');

// Obtener todas las facultades con conteo de carreras (optimizado)
Route::get('facultades-con-carreras', [FacultadController::class, 'indexConConteoCarreras'])
    ->name('facultades.con-carreras');

// Obtener una facultad específica (público)
Route::get('facultades/{facultad}', [FacultadController::class, 'show'])
    ->name('facultades.show');

// Obtener todas las carreras (público)
Route::get('carreras', [CarreraController::class, 'index'])
    ->name('carreras.index');

// Obtener una carrera específica (público)
Route::get('carreras/{carrera}', [CarreraController::class, 'show'])
    ->name('carreras.show');

// Obtener carreras de una facultad específica (público)
Route::get('facultades/{facultad}/carreras', [CarreraController::class, 'getByFacultad'])
    ->name('facultades.carreras');

// Buscar carreras por nombre (público)
Route::get('carreras/buscar/{termino}', [CarreraController::class, 'buscar'])
    ->name('carreras.buscar');

// === RUTAS PROTEGIDAS (REQUIEREN AUTENTICACIÓN) ===
// Operaciones de escritura que requieren usuario autenticado
Route::middleware(['auth:sanctum'])->group(function () {
    // === FACULTADES ===
    // Crear facultad
    Route::post('facultades', [FacultadController::class, 'store'])
        ->name('facultades.store');
    
    // Actualizar facultad
    Route::put('facultades/{facultad}', [FacultadController::class, 'update'])
        ->name('facultades.update');
    Route::patch('facultades/{facultad}', [FacultadController::class, 'update'])
        ->name('facultades.patch');
    
    // Eliminar facultad
    Route::delete('facultades/{facultad}', [FacultadController::class, 'destroy'])
        ->name('facultades.destroy');

    // === CARRERAS ===
    // Crear carrera
    Route::post('carreras', [CarreraController::class, 'store'])
        ->name('carreras.store');
    
    // Actualizar carrera
    Route::put('carreras/{carrera}', [CarreraController::class, 'update'])
        ->name('carreras.update');
    Route::patch('carreras/{carrera}', [CarreraController::class, 'update'])
        ->name('carreras.patch');
    
    // Eliminar carrera
    Route::delete('carreras/{carrera}', [CarreraController::class, 'destroy'])
        ->name('carreras.destroy');
});
