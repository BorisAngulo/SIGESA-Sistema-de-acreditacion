<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;

/*
|--------------------------------------------------------------------------
| Rutas API - Autenticación
|--------------------------------------------------------------------------
|
| Rutas para la autenticación y autorización de usuarios del sistema SIGESA
|
*/

Route::prefix('auth')->group(function () {
    // Rutas públicas (no requieren autenticación)
    Route::post('/login', [AuthController::class, 'login']);
    
    // Rutas protegidas (requieren autenticación)
    Route::middleware('auth:sanctum')->group(function () {
        // Cerrar sesión actual
        Route::post('/logout', [AuthController::class, 'logout']);
        
        // Cerrar todas las sesiones
        Route::post('/logout-all', [AuthController::class, 'logoutAll']);
        
        // Obtener información del usuario autenticado
        Route::get('/me', [AuthController::class, 'me']);
        
        // Obtener permisos del usuario autenticado
        Route::get('/permissions', [AuthController::class, 'getUserPermissions']);
    });
});
