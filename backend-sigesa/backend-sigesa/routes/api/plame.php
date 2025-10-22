<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\PlameController;

/*
|--------------------------------------------------------------------------
| RUTAS API - MATRIZ PLAME
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum'])->prefix('plame')->name('plame.')->group(function () {
    
    // === VERIFICAR EXISTENCIA PLAME ===
    Route::get('/verificar/{carreraModalidadId}', [PlameController::class, 'verificarPlameExiste'])
        ->name('verificar-existe');
    
    // === OBTENER MATRIZ PLAME ===
    Route::get('/carrera-modalidad/{carreraModalidadId}', [PlameController::class, 'getPlameByCarreraModalidad'])
        ->name('get-by-carrera-modalidad');
    
    // === ACTUALIZAR MATRIZ PLAME ===
    Route::put('/relacion', [PlameController::class, 'updateRelacionPlame'])
        ->name('update-relacion');
        
    Route::put('/matriz', [PlameController::class, 'updateMatrizPlame'])
        ->name('update-matriz');
    
    // === RESETEAR MATRIZ ===
    Route::delete('/reset/{plameId}', [PlameController::class, 'resetMatrizPlame'])
        ->name('reset');
    
    // === ESTADÍSTICAS ===
    Route::get('/estadisticas/{plameId}', [PlameController::class, 'getEstadisticasPlame'])
        ->name('estadisticas');
    
    // === FILAS Y COLUMNAS ===
    Route::get('/filas/modalidad/{modalidadId}', [PlameController::class, 'getFilasByModalidad'])
        ->name('filas-by-modalidad');
        
    Route::get('/columnas/modalidad/{modalidadId}', [PlameController::class, 'getColumnasByModalidad'])
        ->name('columnas-by-modalidad');
        
    Route::get('/columnas', [PlameController::class, 'getColumnas'])
        ->name('columnas');
});
