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

// === MODALIDADES ===
Route::apiResource('modalidades', ModalidadController::class);

// === ACREDITACIÓN CARRERA-MODALIDAD ===
Route::apiResource('acreditacion-carreras', CarreraModalidadController::class);

// === RUTAS ESPECÍFICAS ===
// Obtener modalidades disponibles para una carrera
Route::get('carreras/{carrera}/modalidades', [CarreraModalidadController::class, 'getModalidadesByCarrera'])
    ->name('carreras.modalidades');

// Obtener carreras que tienen una modalidad específica
Route::get('modalidades/{modalidad}/carreras', [CarreraModalidadController::class, 'getCarrerasByModalidad'])
    ->name('modalidades.carreras');

// Verificar si una carrera tiene una modalidad específica
Route::get('carreras/{carrera}/modalidades/{modalidad}/verificar', [CarreraModalidadController::class, 'verificarAsociacion'])
    ->name('carreras.modalidades.verificar');
