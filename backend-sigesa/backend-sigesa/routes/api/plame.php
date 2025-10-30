<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\PlameController;

/*
|--------------------------------------------------------------------------
| RUTAS API - DOCUMENTOS PLAME
|--------------------------------------------------------------------------
*/

// === RUTAS PÚBLICAS (SIN AUTENTICACIÓN) ===
Route::prefix('plame')->name('plame.')->group(function () {
    
    // Visualizar documento PLAME en el navegador (sin autenticación)
    Route::get('/{id}/visualizar', [PlameController::class, 'visualizarPlame'])
        ->name('visualizar');
    
    // Descargar documento PLAME (sin autenticación)
    Route::get('/{id}/descargar', [PlameController::class, 'descargarPlame'])
        ->name('descargar');
});

// === RUTAS PROTEGIDAS (CON AUTENTICACIÓN) ===
Route::middleware(['auth:sanctum'])->prefix('plame')->name('plame.')->group(function () {
    
    // === GESTIÓN DE DOCUMENTOS PLAME ===
    
    // Listar todos los documentos PLAME
    Route::get('/', [PlameController::class, 'listarPlames'])
        ->name('listar');
    
    // Obtener documento PLAME por carrera-modalidad
    Route::get('/carrera-modalidad/{carreraModalidadId}', [PlameController::class, 'getPlameByCarreraModalidad'])
        ->name('get-by-carrera-modalidad');
    
    // Obtener información detallada del documento PLAME
    Route::get('/{id}/info', [PlameController::class, 'obtenerInfoPlame'])
        ->name('info');
    
    // Subir nuevo documento PLAME
    Route::post('/', [PlameController::class, 'subirPlame'])
        ->name('subir');
    
    // Actualizar documento PLAME existente
    Route::put('/{id}', [PlameController::class, 'actualizarPlame'])
        ->name('actualizar');
    
    // Eliminar documento PLAME
    Route::delete('/{id}', [PlameController::class, 'eliminarPlame'])
        ->name('eliminar');
});
