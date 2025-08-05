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

// === RUTA DE DESCARGA SIN AUTENTICACIÓN (IGUAL QUE FACULTADES) ===
Route::get('download-backup/{id}', [App\Http\Controllers\BackupController::class, 'downloadNoAuth'])
    ->name('download-backup-no-auth');

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
                'auth' => 'Autenticación y autorización de usuarios',
                'usuarios' => 'Gestión de usuarios del sistema',
                'instituciones' => 'Gestión de facultades y carreras',
                'modalidades' => 'Gestión de modalidades de estudio',
                'procesos' => 'Gestión de fases y subfases de acreditación',
                'documentos' => 'Gestión de documentos del proceso de acreditación'
            ]
        ]
    ]);
});

// === MÓDULOS DE LA API ===
// Cargar rutas organizadas por módulos
require __DIR__.'/api/auth.php';
require __DIR__.'/api/usuarios.php';
require __DIR__.'/api/instituciones.php';
require __DIR__.'/api/modalidades.php';
require __DIR__.'/api/procesos.php';

// === RUTA DE PRUEBA PARA VALIDAR TOKEN ===
Route::get('test-token', function(Request $request) {
    try {
        $token = $request->get('token');
        if (!$token) {
            return response()->json(['error' => 'No token provided']);
        }
        
        $tokenModel = \Laravel\Sanctum\PersonalAccessToken::findToken($token);
        if (!$tokenModel) {
            return response()->json(['error' => 'Invalid token']);
        }
        
        $user = $tokenModel->tokenable;
        return response()->json([
            'success' => true,
            'user_id' => $user->id,
            'user_email' => $user->email,
            'has_admin_role' => $user->hasRole('Admin'),
            'token_valid' => true
        ]);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()]);
    }
});

// === RUTAS DE BACKUPS ===
Route::middleware(['auth:sanctum', 'role:Admin'])->prefix('backups')->name('api.backups.')->group(function () {
    Route::get('/', [App\Http\Controllers\BackupController::class, 'index'])->name('index');
    Route::post('/', [App\Http\Controllers\BackupController::class, 'store'])->name('store');
    Route::get('/stats', [App\Http\Controllers\BackupController::class, 'stats'])->name('stats');
    Route::get('/storage-options', [App\Http\Controllers\BackupController::class, 'getStorageOptions'])->name('storage-options');
    Route::get('/debug-user', [App\Http\Controllers\BackupController::class, 'debugUser'])->name('debug-user'); // Ruta temporal de debugging
    Route::post('/cleanup', [App\Http\Controllers\BackupController::class, 'cleanup'])->name('cleanup');
    Route::get('/{id}', [App\Http\Controllers\BackupController::class, 'show'])->name('show');
    Route::delete('/{id}', [App\Http\Controllers\BackupController::class, 'destroy'])->name('destroy');
    
    // Rutas de descarga con autenticación
    Route::get('/download/{id}', [App\Http\Controllers\BackupController::class, 'download'])->name('download');
    Route::get('/download-public/{id}', [App\Http\Controllers\BackupController::class, 'downloadPublic'])->name('download-public');
});

// === RUTAS TEMPORALES DE DEBUGGING (SIN ROLE MIDDLEWARE) ===
Route::middleware(['auth:sanctum'])->prefix('backups-debug')->group(function () {
    Route::get('/user-info', [App\Http\Controllers\BackupController::class, 'debugUser'])->name('backup-debug.user-info');
    Route::get('/test-direct', [App\Http\Controllers\BackupController::class, 'testDirectBackup'])->name('backup-debug.test-direct');
    Route::post('/test-simple', function() {
        return response()->json(['message' => 'Test simple sin crear backup', 'user_id' => Auth::id()]);
    });
    Route::post('/test-create', function() {
        return response()->json(['message' => 'Test de creación sin middleware role', 'user_id' => Auth::id()]);
    });
});

// === RUTAS DE DEBUGGING PÚBLICAS (SIN AUTENTICACIÓN) ===
Route::prefix('debug')->group(function () {
    Route::get('/ping', function() {
        return response()->json([
            'message' => 'Servidor funcionando correctamente',
            'timestamp' => now(),
            'server_time' => date('Y-m-d H:i:s')
        ]);
    });
    
    Route::get('/auth-test', function(Request $request) {
        return response()->json([
            'authenticated' => Auth::check(),
            'user_id' => Auth::id(),
            'guard' => config('auth.defaults.guard'),
            'sanctum_stateful_domains' => config('sanctum.stateful'),
            'all_headers' => $request->headers->all(),
            'authorization_header' => $request->header('Authorization'),
            'bearer_token' => $request->bearerToken(),
            'user_agent' => $request->userAgent(),
            'origin' => $request->header('Origin'),
            'referer' => $request->header('Referer')
        ]);
    });
    
    Route::middleware(['auth:sanctum'])->get('/protected-test', function() {
        return response()->json([
            'message' => 'Estás autenticado correctamente!',
            'user' => Auth::user(),
            'user_id' => Auth::id()
        ]);
    });
});
require __DIR__.'/api/documentos.php';
require __DIR__.'/api/utilidades.php';
require __DIR__.'/api/activity-logs.php';
