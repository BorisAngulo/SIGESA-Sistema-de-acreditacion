<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UsuarioController;

/*
|--------------------------------------------------------------------------
| Rutas API - Gestión de Usuarios
|--------------------------------------------------------------------------
|
| Rutas para la gestión completa de usuarios del sistema SIGESA
|
*/

// Todas las rutas de usuarios requieren autenticación
Route::middleware(['auth:sanctum'])->prefix('usuarios')->group(function () {
    // Obtener roles disponibles - Solo Admin
    Route::get('/roles', [UsuarioController::class, 'getRoles'])
        ->middleware(['permission:usuarios.roles']);
    
    // Obtener todos los usuarios - Admin y Técnico
    Route::get('/', [UsuarioController::class, 'index'])
        ->middleware(['permission:usuarios.index']);
    
    // Crear un nuevo usuario - Solo Admin
    Route::post('/', [UsuarioController::class, 'store'])
        ->middleware(['permission:usuarios.store']);
    
    // Obtener un usuario específico - Admin y Técnico
    Route::get('/{id}', [UsuarioController::class, 'show'])
        ->middleware(['permission:usuarios.show']);
    
    // Actualizar un usuario - Solo Admin
    Route::put('/{id}', [UsuarioController::class, 'update'])
        ->middleware(['permission:usuarios.update']);
    
    // Eliminar un usuario - Solo Admin
    Route::delete('/{id}', [UsuarioController::class, 'destroy'])
        ->middleware(['permission:usuarios.destroy']);
});
