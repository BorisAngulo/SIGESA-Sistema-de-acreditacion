<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\FodaAnalisisController;

/*
|--------------------------------------------------------------------------
| RUTAS API - ANÁLISIS FODA
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum'])->prefix('foda')->name('foda.')->group(function () {
    
    // === OBTENER ANÁLISIS FODA POR SUBFASE ===
    Route::get('/subfase/{subfaseId}', [FodaAnalisisController::class, 'getBySubfase'])
        ->name('get-by-subfase');
    
    // === GESTIÓN DE ELEMENTOS FODA ===
    Route::post('/elementos', [FodaAnalisisController::class, 'storeElemento'])
        ->name('elementos.store');
        
    Route::put('/elementos/{elementoId}', [FodaAnalisisController::class, 'updateElemento'])
        ->name('elementos.update');
        
    Route::delete('/elementos/{elementoId}', [FodaAnalisisController::class, 'deleteElemento'])
        ->name('elementos.delete');
    
    // === GESTIÓN DEL ANÁLISIS FODA ===
    Route::put('/analisis/{analisisId}/estado', [FodaAnalisisController::class, 'updateEstado'])
        ->name('analisis.update-estado');

    // === GESTIÓN DE ESTRATEGIAS CRUZADAS ===
    Route::post('/estrategias-cruzadas', [FodaAnalisisController::class, 'storeEstrategiaCruzada'])
        ->name('estrategias-cruzadas.store');
        
    Route::get('/analisis/{analisisId}/estrategias-cruzadas', [FodaAnalisisController::class, 'getEstrategiasCruzadas'])
        ->name('estrategias-cruzadas.get');

    // === CATÁLOGOS ===
    Route::get('/tipos-estrategias', [FodaAnalisisController::class, 'getTiposEstrategias'])
        ->name('tipos-estrategias');
});
