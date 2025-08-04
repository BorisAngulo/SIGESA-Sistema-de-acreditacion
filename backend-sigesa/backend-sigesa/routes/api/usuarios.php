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
    // Obtener roles disponibles
    Route::get('/roles', [UsuarioController::class, 'getRoles']);
    
    // Obtener todos los usuarios
    Route::get('/', [UsuarioController::class, 'index']);
    
    // Crear un nuevo usuario
    Route::post('/', [UsuarioController::class, 'store']);
    
    // Obtener un usuario específico
    Route::get('/{id}', [UsuarioController::class, 'show']);
    
    // Actualizar un usuario
    Route::put('/{id}', [UsuarioController::class, 'update']);
    
    // Eliminar un usuario
    Route::delete('/{id}', [UsuarioController::class, 'destroy']);
});
