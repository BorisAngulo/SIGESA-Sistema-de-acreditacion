<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// === AUTENTICACIÓN ===
Route::middleware('auth:api')->get('/user', function (Request $request) {
    return $request->user();
});

// === INFORMACIÓN DE LA API ===
Route::get('/', function () {
    return response()->json([
        'exito' => true,
        'estado' => 200,
        'datos' => [
            'nombre' => 'SIGESA API',
            'version' => '1.0.0',
            'descripcion' => 'Sistema de Gestión de Acreditación',
            'documentacion' => url('/api/documentation'),
            'endpoints' => [
                'instituciones' => 'Gestión de facultades y carreras',
                'modalidades' => 'Gestión de modalidades de estudio',
                'procesos' => 'Gestión de fases y subfases de acreditación'
            ]
        ]
    ]);
});

// === MÓDULOS DE LA API ===
// Cargar rutas organizadas por módulos
require __DIR__.'/api/instituciones.php';
require __DIR__.'/api/modalidades.php';
require __DIR__.'/api/procesos.php';
require __DIR__.'/api/utilidades.php';
