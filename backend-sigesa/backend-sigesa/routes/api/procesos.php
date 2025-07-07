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

// === FASES ===
Route::apiResource('fases', FaseController::class);

// === SUBFASES ===
Route::apiResource('subfases', SubfaseController::class);

// === RUTAS ESPECÍFICAS ===
// Obtener subfases de una fase específica
Route::get('fases/{fase}/subfases', [SubfaseController::class, 'getByFase'])
    ->name('fases.subfases');

// Obtener fases activas
Route::get('fases/activas', [FaseController::class, 'getActivas'])
    ->name('fases.activas');

// Obtener subfases activas de una fase
Route::get('fases/{fase}/subfases/activas', [SubfaseController::class, 'getActivasByFase'])
    ->name('fases.subfases.activas');

// Marcar fase como completada
Route::patch('fases/{fase}/completar', [FaseController::class, 'marcarCompletada'])
    ->name('fases.completar');

// Marcar subfase como completada
Route::patch('subfases/{subfase}/completar', [SubfaseController::class, 'marcarCompletada'])
    ->name('subfases.completar');
