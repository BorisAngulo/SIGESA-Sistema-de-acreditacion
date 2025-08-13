<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\DocumentoController;

/*
|--------------------------------------------------------------------------
| Rutas de Documentos con Permisos
|--------------------------------------------------------------------------
|
| Rutas relacionadas con la gestión de documentos
| y su asociación con fases y subfases
| Cada ruta incluye verificación de permisos específicos
|
*/

// === RUTA PÚBLICA DE DESCARGA ===
// Esta ruta requiere autenticación pero permite fácil descarga con permisos básicos

// Descargar un documento (requiere permiso de descarga)
Route::middleware(['auth:sanctum', 'permission:documentos.download'])->group(function () {
    Route::get('documentos/{documento}/descargar', [DocumentoController::class, 'descargar'])
        ->name('documentos.descargar');
});

// === RUTAS PROTEGIDAS CON PERMISOS ESPECÍFICOS ===
Route::middleware(['auth:sanctum'])->group(function () {
    
    // === DOCUMENTOS CRUD ===
    Route::get('documentos', [DocumentoController::class, 'index'])
        ->middleware(['permission:documentos.index'])
        ->name('documentos.index');
        
    Route::get('documentos/{documento}', [DocumentoController::class, 'show'])
        ->middleware(['permission:documentos.show'])
        ->name('documentos.show');
        
    Route::post('documentos', [DocumentoController::class, 'store'])
        ->middleware(['permission:documentos.store'])
        ->name('documentos.store');
        
    Route::put('documentos/{documento}', [DocumentoController::class, 'update'])
        ->middleware(['permission:documentos.update'])
        ->name('documentos.update');
        
    Route::delete('documentos/{documento}', [DocumentoController::class, 'destroy'])
        ->middleware(['permission:documentos.destroy'])
        ->name('documentos.destroy');

    // === ASOCIACIONES DE DOCUMENTOS ===
    Route::get('documentos/{documento}/asociaciones', [DocumentoController::class, 'getAsociaciones'])
        ->middleware(['permission:documentos.asociaciones'])
        ->name('documentos.asociaciones');

    // === DOCUMENTOS POR FASE ===
    Route::get('fases/{fase}/documentos', [DocumentoController::class, 'getDocumentosByFase'])
        ->middleware(['permission:fases.documentos'])
        ->name('fases.documentos');
        
    Route::post('fases/{fase}/documentos', [DocumentoController::class, 'asociarDocumentoAFase'])
        ->middleware(['permission:fases.documentos'])
        ->name('fases.documentos.asociar');

    // === DOCUMENTOS POR SUBFASE ===
    Route::get('subfases/{subfase}/documentos', [DocumentoController::class, 'getDocumentosBySubfase'])
        ->middleware(['permission:subfases.documentos'])
        ->name('subfases.documentos');
        
    Route::post('subfases/{subfase}/documentos', [DocumentoController::class, 'asociarDocumentoASubfase'])
        ->middleware(['permission:subfases.documentos'])
        ->name('subfases.documentos.asociar');
});
