<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ActivityLogController;

/*
|--------------------------------------------------------------------------
| Activity Logs API Routes
|--------------------------------------------------------------------------
|
| Rutas para la gestión de logs de actividad del sistema
|
*/

Route::middleware(['auth:sanctum'])->prefix('activity-logs')->group(function () {
    
    // Obtener lista de logs de actividad con filtros
    Route::get('/', [ActivityLogController::class, 'index'])
        ->name('activity-logs.index');
    
    // Obtener un log específico
    Route::get('/{id}', [ActivityLogController::class, 'show'])
        ->name('activity-logs.show');
    
    // Obtener estadísticas de actividad
    Route::get('/stats/summary', [ActivityLogController::class, 'getStats'])
        ->name('activity-logs.stats');
    
    // Obtener historial de un modelo específico
    Route::get('/model/{modelType}/{modelId}', [ActivityLogController::class, 'getModelHistory'])
        ->name('activity-logs.model-history');
    
});
