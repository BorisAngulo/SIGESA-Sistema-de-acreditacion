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
    
    // KPIs principales del sistema
    Route::get('kpis', [ReportesController::class, 'getKPIs'])
        ->name('reportes.kpis');
    
    // Análisis por facultades
    Route::get('facultades/analisis', [ReportesController::class, 'getAnalisisFacultades'])
        ->name('reportes.facultades.analisis');
    
    // Progreso por modalidades
    Route::get('modalidades/progreso', [ReportesController::class, 'getProgresoModalidades'])
        ->name('reportes.modalidades.progreso');
    
    // Tendencias temporales
    Route::get('tendencias-temporales', [ReportesController::class, 'getTendenciasTemporales'])
        ->name('reportes.tendencias');
    
    // Distribución de estados
    Route::get('estados/distribucion', [ReportesController::class, 'getDistribucionEstados'])
        ->name('reportes.estados.distribucion');
    
    // Nuevo: Reporte completo de facultades (debe ir antes de rutas específicas)
    Route::get('facultades', [ReportesController::class, 'getReporteFacultades'])
        ->name('reportes.facultades.reporte');
    
    // Carreras con detalles de acreditación por facultad
    Route::get('facultades/{facultadId}/carreras', [ReportesController::class, 'getCarrerasConAcreditacion'])
        ->name('reportes.facultades.carreras');
    
    // Nuevo: Estadísticas específicas de una facultad
    Route::get('facultades/{facultadId}/estadisticas', [ReportesController::class, 'getEstadisticasFacultad'])
        ->name('reportes.facultades.estadisticas');
});