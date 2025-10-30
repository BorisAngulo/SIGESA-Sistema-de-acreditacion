<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\FaseController;
use App\Http\Controllers\Api\SubfaseController;

/*
|--------------------------------------------------------------------------
| Rutas de Procesos de Acreditación
|--------------------------------------------------------------------------
|
| Rutas relacionadas con la gestión de fases y subfases
| del proceso de acreditación
|
*/

// === RUTAS PÚBLICAS (SOLO LECTURA) ===
// Consultas que no requieren autenticación para mostrar datos básicos

// Obtener todas las fases (público)
Route::get('fases', [FaseController::class, 'index'])
    ->name('fases.index');

// Obtener una fase específica (público)
Route::get('fases/{fase}', [FaseController::class, 'show'])
    ->name('fases.show');

// Obtener todas las subfases (público)
Route::get('subfases', [SubfaseController::class, 'index'])
    ->name('subfases.index');

// Obtener una subfase específica (público)
Route::get('subfases/{subfase}', [SubfaseController::class, 'show'])
    ->name('subfases.show');

// Obtener subfases de una fase específica (público)
Route::get('fases/{fase}/subfases', [SubfaseController::class, 'getByFase'])
    ->name('fases.subfases');

// Obtener fases activas (público)
Route::get('fases/activas', [FaseController::class, 'getActivas'])
    ->name('fases.activas');

// Obtener subfases activas de una fase específica (público)
Route::get('fases/{fase}/subfases/activas', [SubfaseController::class, 'getActivasByFase'])
    ->name('fases.subfases.activas');

// Obtener el progreso de una fase (público)
Route::get('fases/{fase}/progreso', [FaseController::class, 'getProgreso'])
    ->name('fases.progreso');

// Obtener el avance en porcentaje de una fase (público)
Route::get('fases/{fase}/avance', [FaseController::class, 'getAvance'])
    ->name('fases.avance');

// Obtener el progreso de una subfase (público)
Route::get('subfases/{subfase}/progreso', [SubfaseController::class, 'getProgreso'])
    ->name('subfases.progreso');

// === RUTAS PROTEGIDAS (REQUIEREN AUTENTICACIÓN) ===
// Operaciones de escritura que requieren usuario autenticado
Route::middleware(['auth:sanctum'])->group(function () {
    // === FASES ===
    // Generar plantilla de fases y subfases
    Route::post('fases/generar-plantilla', [FaseController::class, 'generarPlantilla'])
        ->name('fases.generar-plantilla');
    
    // Crear fase
    Route::post('fases', [FaseController::class, 'store'])
        ->name('fases.store');
    
    // Actualizar fase
    Route::put('fases/{fase}', [FaseController::class, 'update'])
        ->name('fases.update');
    Route::patch('fases/{fase}', [FaseController::class, 'update'])
        ->name('fases.patch');
    
    // Eliminar fase
    Route::delete('fases/{fase}', [FaseController::class, 'destroy'])
        ->name('fases.destroy');

    // Marcar fase como completada
    Route::patch('fases/{fase}/completar', [FaseController::class, 'marcarCompletada'])
        ->name('fases.completar');

    // === SUBFASES ===
    // Crear subfase
    Route::post('subfases', [SubfaseController::class, 'store'])
        ->name('subfases.store');
    
    // Actualizar subfase
    Route::put('subfases/{subfase}', [SubfaseController::class, 'update'])
        ->name('subfases.update');
    Route::patch('subfases/{subfase}', [SubfaseController::class, 'update'])
        ->name('subfases.patch');
    
    // Eliminar subfase
    Route::delete('subfases/{subfase}', [SubfaseController::class, 'destroy'])
        ->name('subfases.destroy');

    // Marcar subfase como completada
    Route::patch('subfases/{subfase}/completar', [SubfaseController::class, 'marcarCompletada'])
        ->name('subfases.completar');

    // Obtener documentos de una subfase específica (requiere auth y permisos)
    Route::get('subfases/{subfase}/documentos', [SubfaseController::class, 'getDocumentos'])
        ->middleware('permission:subfases.documentos')
        ->name('subfases.documentos');
});
