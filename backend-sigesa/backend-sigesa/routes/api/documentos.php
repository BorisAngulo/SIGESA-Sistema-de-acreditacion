<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\DocumentoController;

/*
|--------------------------------------------------------------------------
| Rutas de Documentos
|--------------------------------------------------------------------------
|
| Rutas relacionadas con la gestión de documentos
| y su asociación con fases y subfases
|
*/

// Todas las rutas de documentos requieren autenticación
Route::middleware(['auth:sanctum'])->group(function () {
    // === DOCUMENTOS ===
    Route::apiResource('documentos', DocumentoController::class);

    // === RUTAS ESPECÍFICAS ===
    // Descargar un documento
    Route::get('documentos/{documento}/descargar', [DocumentoController::class, 'descargar'])
        ->name('documentos.descargar');

    // Obtener documentos de una fase específica
    Route::get('fases/{fase}/documentos', [DocumentoController::class, 'getDocumentosByFase'])
        ->name('fases.documentos');

    // Asociar documento existente a una fase
    Route::post('fases/{fase}/documentos', [DocumentoController::class, 'asociarDocumentoAFase'])
        ->name('fases.documentos.asociar');

    // Obtener documentos de una subfase específica
    Route::get('subfases/{subfase}/documentos', [DocumentoController::class, 'getDocumentosBySubfase'])
        ->name('subfases.documentos');

    // Asociar documento existente a una subfase
    Route::post('subfases/{subfase}/documentos', [DocumentoController::class, 'asociarDocumentoASubfase'])
        ->name('subfases.documentos.asociar');
});
