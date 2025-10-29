<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ReportesController;

/*
|--------------------------------------------------------------------------
| RUTAS DE REPORTES Y ANALYTICS
|--------------------------------------------------------------------------
| Rutas para obtener datos estadísticos y reportes del sistema
*/

Route::prefix('reportes')->group(function () {

    // Carreras con detalles de acreditación por facultad
    Route::get('facultades/{facultadId}/carreras', [ReportesController::class, 'getCarrerasConAcreditacion'])
        ->name('reportes.facultades.carreras');
    
    // Nuevo: Reporte completo de facultades (debe ir antes de rutas específicas)
    Route::get('facultades', [ReportesController::class, 'getReporteFacultades'])
        ->name('reportes.facultades.reporte');
    
    // Nuevo: Estadísticas específicas de una facultad
    Route::get('facultades/{facultadId}/estadisticas', [ReportesController::class, 'getEstadisticasFacultad'])
        ->name('reportes.facultades.estadisticas');
});