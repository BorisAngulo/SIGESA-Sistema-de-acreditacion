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

// === FACULTADES ===
Route::apiResource('facultades', FacultadController::class);

// === CARRERAS ===
Route::apiResource('carreras', CarreraController::class);

// === RUTAS ESPECÍFICAS ===
// Obtener carreras de una facultad específica
Route::get('facultades/{facultad}/carreras', [CarreraController::class, 'getByFacultad'])
    ->name('facultades.carreras');

// Buscar carreras por nombre
Route::get('carreras/buscar/{termino}', [CarreraController::class, 'buscar'])
    ->name('carreras.buscar');
