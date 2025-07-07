<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Rutas de Documentación y Utilidades
|--------------------------------------------------------------------------
|
| Rutas para documentación, herramientas y utilidades del sistema
|
*/

// === DOCUMENTACIÓN ===
// La documentación Swagger se maneja automáticamente por l5-swagger
// pero puedes agregar rutas personalizadas aquí

// === UTILIDADES ===
// Endpoint para verificar el estado del sistema
Route::get('health', function () {
    return response()->json([
        'exito' => true,
        'estado' => 200,
        'datos' => [
            'status' => 'OK',
            'timestamp' => now()->toISOString(),
            'version' => config('app.version', '1.0.0'),
            'database' => 'Connected'
        ]
    ]);
})->name('api.health');

// Endpoint para obtener configuraciones públicas
Route::get('config', function () {
    return response()->json([
        'exito' => true,
        'estado' => 200,
        'datos' => [
            'app_name' => config('app.name'),
            'timezone' => config('app.timezone'),
            'locale' => config('app.locale'),
            'version' => config('app.version', '1.0.0')
        ]
    ]);
})->name('api.config');

// Endpoint para validar tokens (si se usa autenticación)
Route::middleware('auth:api')->get('validate-token', function () {
    return response()->json([
        'exito' => true,
        'estado' => 200,
        'datos' => [
            'valid' => true,
            'user' => auth()->user()
        ]
    ]);
})->name('api.validate-token');
