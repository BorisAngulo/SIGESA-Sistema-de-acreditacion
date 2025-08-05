<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use App\Models\Backup;
use App\Traits\LogsActivity;
use Carbon\Carbon;

class BackupController extends Controller
{
    use LogsActivity;

    public function __construct()
    {
        // Middleware de autenticación restaurado
        $this->middleware('auth:sanctum')->except(['downloadNoAuth']);
        $this->middleware('role:Admin')->except(['downloadNoAuth']); 
    }

    /**
     * Listar todos los backups
     */
    public function index(Request $request)
    {
        $query = Backup::with('creator')
            ->orderBy('created_at', 'desc');

        // Filtros opcionales
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('type')) {
            $query->where('backup_type', $request->type);
        }

        if ($request->has('days')) {
            $query->recent($request->days);
        }

        $backups = $query->paginate(15);

        return response()->json([
            'backups' => $backups,
            'summary' => [
                'total' => Backup::count(),
                'completed' => Backup::completed()->count(),
                'failed' => Backup::where('status', 'failed')->count(),
                'total_size' => Backup::completed()->sum('file_size'),
                'last_backup' => Backup::completed()->latest()->first()?->created_at,
            ]
        ]);
    }

    /**
     * Crear un nuevo backup manual
     */
    public function store(Request $request)
    {
        try {
            \Log::info('=== INICIO CREACIÓN DE BACKUP ===');
            
            // Validar parámetros opcionales
            $request->validate([
                'storage_disk' => 'nullable|string|in:local,google'
            ]);
            
            // Determinar disco de almacenamiento
            $storageDisk = $request->get('storage_disk', env('BACKUP_STORAGE_DISK', 'local'));
            
            // Crear timestamp único para este backup
            $timestamp = now();
            $uniqueId = $timestamp->format('Y-m-d_His') . '_' . uniqid();
            
            // Crear registro de backup con nombre único
            $backup = Backup::create([
                'filename' => 'backup-' . $uniqueId . '.zip',
                'backup_type' => 'manual',
                'status' => 'processing',
                'created_by' => Auth::id() ?? 1, // Usar ID 1 si no hay auth
                'storage_disk' => $storageDisk,
            ]);

            \Log::info('Registro de backup creado exitosamente', [
                'backup_id' => $backup->id,
                'unique_id' => $uniqueId,
                'storage_disk' => $storageDisk,
                'backup_data' => $backup->toArray()
            ]);

            // NUEVO: Usar método manual en lugar de Spatie
            $backupResult = $this->createManualBackup($backup, $storageDisk);
            
            if ($backupResult['success']) {
                return response()->json([
                    'message' => 'Backup completado correctamente',
                    'backup' => $backup->fresh(),
                    'details' => $backupResult['details']
                ], 201);
            } else {
                return response()->json([
                    'message' => 'Error al crear backup',
                    'error' => $backupResult['error'],
                    'backup' => $backup->fresh()
                ], 500);
            }

        } catch (\Exception $e) {
            \Log::error('Error en creación de backup', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);

            // Actualizar estado del backup a failed si existe
            if (isset($backup)) {
                $backup->update([
                    'status' => 'failed',
                    'error_message' => $e->getMessage()
                ]);
            }
            
            return response()->json([
                'message' => 'Error al crear backup',
                'error' => $e->getMessage(),
                'debug_info' => [
                    'file' => $e->getFile(),
                    'line' => $e->getLine()
                ]
            ], 500);
        }
    }

    /**
     * Mostrar información de un backup específico
     */
    public function show($id)
    {
        $backup = Backup::with('creator')->findOrFail($id);

        return response()->json([
            'backup' => $backup,
            'file_exists' => $backup->fileExists(),
            'download_url' => $backup->getDownloadUrl()
        ]);
    }

    /**
     * Descargar un backup SIN AUTENTICACIÓN PREVIA (solo validación interna)
     */
    public function downloadPublic(Request $request, $id)
    {
        try {
            \Log::info('Descarga pública sin auth previa', [
                'backup_id' => $id,
                'has_token' => $request->has('token'),
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent()
            ]);

            // Validar token en query - OPCIONAL para esta ruta
            if (!$request->has('token')) {
                \Log::error('Descarga sin token');
                return response('Se requiere token de autenticación', 401)
                    ->header('Content-Type', 'text/plain');
            }

            $token = $request->get('token');
            \Log::info('Validando token para descarga', ['token_prefix' => substr($token, 0, 20)]);
            
            // Buscar el token en la base de datos
            $tokenModel = \Laravel\Sanctum\PersonalAccessToken::findToken($token);
            if (!$tokenModel) {
                \Log::error('Token no válido', ['token_prefix' => substr($token, 0, 20)]);
                return response('Token de autenticación inválido', 401)
                    ->header('Content-Type', 'text/plain');
            }

            $user = $tokenModel->tokenable;
            if (!$user) {
                \Log::error('Usuario no encontrado para token');
                return response('Usuario no encontrado', 401)
                    ->header('Content-Type', 'text/plain');
            }

            \Log::info('Usuario validado', [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'roles' => $user->roles->pluck('name')->toArray()
            ]);
            
            // Validar permisos de Admin - OPCIONAL, quitar si quieres permitir a todos
            if (!$user->hasRole('Admin')) {
                \Log::warning('Usuario sin rol Admin intenta descargar', [
                    'user_id' => $user->id,
                    'user_roles' => $user->roles->pluck('name')->toArray()
                ]);
                return response('Se requieren permisos de administrador', 403)
                    ->header('Content-Type', 'text/plain');
            }

            // Buscar el backup
            $backup = Backup::find($id);
            if (!$backup) {
                \Log::error('Backup no encontrado', ['backup_id' => $id]);
                return response('Backup no encontrado', 404)
                    ->header('Content-Type', 'text/plain');
            }
            
            \Log::info('Backup localizado', [
                'backup_id' => $backup->id,
                'filename' => $backup->filename,
                'file_path' => $backup->file_path,
                'file_size' => $backup->file_size,
                'status' => $backup->status
            ]);

            // Validar que existe el archivo físico
            if (!$backup->file_path || !Storage::exists($backup->file_path)) {
                \Log::error('Archivo físico no existe', [
                    'backup_id' => $backup->id,
                    'file_path' => $backup->file_path,
                    'storage_exists' => $backup->file_path ? Storage::exists($backup->file_path) : false
                ]);
                
                return response('Archivo de backup no disponible', 404)
                    ->header('Content-Type', 'text/plain');
            }

            // Obtener información del archivo
            $fileSize = Storage::size($backup->file_path);
            if ($fileSize === 0) {
                \Log::error('Archivo vacío', ['backup_id' => $backup->id, 'file_path' => $backup->file_path]);
                return response('Archivo de backup vacío', 422)
                    ->header('Content-Type', 'text/plain');
            }

            $downloadFilename = $backup->filename ?: 'backup-' . $backup->id . '-' . date('Y-m-d-H-i-s') . '.zip';

            \Log::info('Iniciando transferencia de archivo', [
                'backup_id' => $backup->id,
                'filename' => $downloadFilename,
                'file_size' => $fileSize,
                'user_id' => $user->id
            ]);

            // Obtener contenido y enviarlo
            $fileContents = Storage::get($backup->file_path);
            
            return response($fileContents, 200)
                ->header('Content-Type', 'application/zip')
                ->header('Content-Disposition', 'attachment; filename="' . $downloadFilename . '"')
                ->header('Content-Length', $fileSize)
                ->header('Cache-Control', 'no-cache, must-revalidate')
                ->header('Pragma', 'no-cache')
                ->header('Expires', '0');
            
        } catch (\Exception $e) {
            \Log::error('Error crítico en descarga pública', [
                'backup_id' => $id,
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            
            return response('Error del servidor: ' . $e->getMessage(), 500)
                ->header('Content-Type', 'text/plain');
        }
    }

    /**
     * Descarga pública sin autenticación (como las rutas de facultades)
     */
    public function downloadNoAuth($id)
    {
        try {
            // Buscar backup
            $backup = Backup::find($id);
            if (!$backup) {
                return response()->json(['error' => 'Backup no encontrado'], 404);
            }

            // Validar archivo
            if (!$backup->file_path || !Storage::exists($backup->file_path)) {
                return response()->json(['error' => 'Archivo no disponible'], 404);
            }

            // Generar nombre y obtener contenido
            $filename = $backup->filename ?: 'backup-' . $backup->id . '.zip';
            $content = Storage::get($backup->file_path);
            $size = Storage::size($backup->file_path);

            // Retornar archivo
            return response($content)
                ->header('Content-Type', 'application/zip')
                ->header('Content-Disposition', 'attachment; filename="' . $filename . '"')
                ->header('Content-Length', $size);
                
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error interno: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Descargar un backup
     */
    public function download(Request $request, $id)
    {
        try {
            // NUEVO: Manejar autenticación por token en query si no hay header
            $user = Auth::user();
            if (!$user && $request->has('token')) {
                $token = $request->get('token');
                \Log::info('Intentando autenticación por token query', ['token_prefix' => substr($token, 0, 10)]);
                
                // Intentar autenticar usando el token de la query
                $tokenModel = \Laravel\Sanctum\PersonalAccessToken::findToken($token);
                if ($tokenModel) {
                    $user = $tokenModel->tokenable;
                    \Log::info('Usuario autenticado via token query', ['user_id' => $user->id]);
                } else {
                    \Log::error('Token inválido en query parameter');
                    return response()->json(['message' => 'Token inválido'], 401)
                        ->header('Access-Control-Allow-Origin', 'http://localhost:3000');
                }
            }
            
            if (!$user) {
                \Log::error('Usuario no autenticado para descarga');
                return response()->json(['message' => 'No autenticado'], 401)
                    ->header('Access-Control-Allow-Origin', 'http://localhost:3000');
            }
            
            \Log::info('Iniciando descarga de backup', ['backup_id' => $id, 'user_id' => $user->id]);
            
            $backup = Backup::findOrFail($id);
            
            \Log::info('Backup encontrado', [
                'backup_id' => $backup->id,
                'filename' => $backup->filename,
                'file_path' => $backup->file_path,
                'file_size' => $backup->file_size,
                'status' => $backup->status,
                'storage_disk' => $backup->storage_disk ?? 'local'
            ]);

            if (!$backup->file_path) {
                \Log::error('Backup sin file_path', ['backup_id' => $backup->id]);
                return response()->json([
                    'message' => 'Backup no tiene ruta de archivo definida'
                ], 404)
                ->header('Access-Control-Allow-Origin', 'http://localhost:3000');
            }

            // Determinar el disco de almacenamiento
            $storageDisk = $backup->storage_disk ?? 'local';
            $disk = $storageDisk === 'google' ? \Storage::disk('google') : \Storage::disk('local');
            
            // Validar que existe el archivo
            if (!$disk->exists($backup->file_path)) {
                \Log::error('Archivo de backup no existe', [
                    'backup_id' => $backup->id,
                    'file_path' => $backup->file_path,
                    'storage_disk' => $storageDisk
                ]);
                
                return response()->json([
                    'message' => 'Archivo de backup no encontrado en el almacenamiento'
                ], 404)
                ->header('Access-Control-Allow-Origin', 'http://localhost:3000');
            }

            // Verificar que el archivo no esté vacío
            $fileSize = $disk->size($backup->file_path);
            if ($fileSize === 0) {
                \Log::error('Archivo de backup está vacío', [
                    'backup_id' => $backup->id,
                    'file_path' => $backup->file_path,
                    'storage_disk' => $storageDisk
                ]);
                
                return response()->json([
                    'message' => 'El archivo de backup está vacío'
                ], 422)
                ->header('Access-Control-Allow-Origin', 'http://localhost:3000');
            }

            // Log de actividad
            \Log::info('Iniciando descarga de archivo', [
                'backup_id' => $backup->id,
                'filename' => $backup->filename,
                'file_path' => $backup->file_path,
                'file_size' => $fileSize,
                'storage_disk' => $storageDisk,
                'user_id' => $user->id
            ]);

            // Usar el filename del backup o generar uno si no existe
            $downloadFilename = $backup->filename ?: 'backup-' . $backup->id . '-' . date('Y-m-d-H-i-s') . '.zip';

            // Obtener contenido del archivo desde el disco correspondiente
            $fileContents = $disk->get($backup->file_path);
            
            return response($fileContents, 200)
                ->header('Content-Type', 'application/zip')
                ->header('Content-Disposition', 'attachment; filename="' . $downloadFilename . '"')
                ->header('Content-Length', $fileSize)
                ->header('Access-Control-Allow-Origin', 'http://localhost:3000')
                ->header('Access-Control-Allow-Credentials', 'true')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
            
        } catch (\Exception $e) {
            \Log::error('Error en descarga de backup', [
                'backup_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Error interno al descargar backup: ' . $e->getMessage()
            ], 500)
            ->header('Access-Control-Allow-Origin', 'http://localhost:3000')
            ->header('Access-Control-Allow-Credentials', 'true');
        }
    }

    /**
     * Eliminar un backup
     */
    public function destroy($id)
    {
        try {
            $backup = Backup::findOrFail($id);

            // Eliminar archivo del storage
            if ($backup->fileExists()) {
                Storage::delete($backup->file_path);
                \Log::info('Archivo de backup eliminado del storage', [
                    'backup_id' => $backup->id,
                    'file_path' => $backup->file_path
                ]);
            }

            // Log de actividad antes de eliminar
            \Log::info('Backup eliminado', [
                'backup_id' => $backup->id,
                'filename' => $backup->filename,
                'user_id' => Auth::id(),
                'backup_data' => $backup->toArray()
            ]);

            $backup->delete();

            return response()->json([
                'message' => 'Backup eliminado correctamente'
            ]);

        } catch (\Exception $e) {
            \Log::error('Error al eliminar backup', [
                'backup_id' => $id,
                'error' => $e->getMessage(),
                'user_id' => Auth::id()
            ]);

            return response()->json([
                'message' => 'Error al eliminar backup',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener estadísticas de backups
     */
    public function stats()
    {
        $stats = [
            'total_backups' => Backup::count(),
            'completed_backups' => Backup::completed()->count(),
            'failed_backups' => Backup::where('status', 'failed')->count(),
            'manual_backups' => Backup::manual()->count(),
            'scheduled_backups' => Backup::scheduled()->count(),
            'total_size' => Backup::completed()->sum('file_size'),
            'last_backup' => Backup::completed()->latest()->first(),
            'last_successful' => Backup::completed()->latest()->first()?->created_at,
            'storage_options' => $this->getStorageOptions(),
            'storage_stats' => [
                'local_backups' => Backup::where('storage_disk', 'local')->count(),
                'google_drive_backups' => Backup::where('storage_disk', 'google')->count(),
            ]
        ];

        return response()->json($stats);
    }

    /**
     * Obtener opciones de almacenamiento disponibles
     */
    public function getStorageOptions()
    {
        $options = [
            'local' => [
                'name' => 'Almacenamiento Local',
                'description' => 'Guardar backups en el servidor local',
                'available' => true,
                'icon' => 'server'
            ]
        ];

        // Verificar si Google Drive está configurado
        $googleConfigured = config('filesystems.disks.google.clientId') && 
                          config('filesystems.disks.google.clientSecret') && 
                          config('filesystems.disks.google.refreshToken');

        $options['google'] = [
            'name' => 'Google Drive',
            'description' => 'Guardar backups en Google Drive (en la nube)',
            'available' => $googleConfigured,
            'icon' => 'cloud',
            'configured' => $googleConfigured
        ];

        return $options;
    }

    /**
     * Endpoint temporal para debugging - verificar estado del usuario
     */
    public function debugUser()
    {
        $user = Auth::user();
        
        return response()->json([
            'authenticated' => Auth::check(),
            'user_id' => Auth::id(),
            'user_email' => $user->email ?? null,
            'user_name' => $user->name ?? null,
            'has_admin_role' => $user ? $user->hasRole('Admin') : false,
            'all_roles' => $user ? $user->roles->pluck('name')->toArray() : [],
            'middleware_applied' => true,
            'can_access_backups' => true, // Si llega aquí, puede acceder
        ]);
    }

    /**
     * Método de prueba para backup directo con pg_dump
     */
    public function testDirectBackup()
    {
        try {
            \Log::info('=== PRUEBA BACKUP DIRECTO ===');
            
            // Configuración de la base de datos
            $host = config('database.connections.pgsql.host');
            $port = config('database.connections.pgsql.port');
            $database = config('database.connections.pgsql.database');
            $username = config('database.connections.pgsql.username');
            $password = config('database.connections.pgsql.password');
            
            \Log::info('Configuración DB', [
                'host' => $host,
                'port' => $port,
                'database' => $database,
                'username' => $username,
                'password_set' => !empty($password)
            ]);
            
            // Crear nombre de archivo temporal
            $filename = 'test_backup_' . date('Y-m-d_H-i-s') . '.sql';
            $filepath = storage_path('app/' . $filename);
            
            // Configurar variable de entorno PGPASSWORD
            putenv("PGPASSWORD={$password}");
            
            // Comando pg_dump
            $command = sprintf(
                'pg_dump --host=%s --port=%s --username=%s --dbname=%s --no-owner --no-acl --file=%s',
                escapeshellarg($host),
                escapeshellarg($port),
                escapeshellarg($username),
                escapeshellarg($database),
                escapeshellarg($filepath)
            );
            
            \Log::info('Ejecutando comando', ['command' => $command]);
            
            // Ejecutar comando
            $output = [];
            $exitCode = null;
            exec($command . ' 2>&1', $output, $exitCode);
            
            \Log::info('Resultado comando directo', [
                'exit_code' => $exitCode,
                'output' => $output,
                'file_exists' => file_exists($filepath),
                'file_size' => file_exists($filepath) ? filesize($filepath) : 0
            ]);
            
            // Limpiar variable de entorno
            putenv("PGPASSWORD");
            
            if ($exitCode === 0 && file_exists($filepath) && filesize($filepath) > 0) {
                return response()->json([
                    'message' => 'Backup directo exitoso',
                    'file_size' => filesize($filepath),
                    'filename' => $filename,
                    'output' => $output
                ]);
            } else {
                return response()->json([
                    'message' => 'Backup directo falló',
                    'exit_code' => $exitCode,
                    'output' => $output,
                    'file_exists' => file_exists($filepath),
                    'file_size' => file_exists($filepath) ? filesize($filepath) : 0
                ], 500);
            }
            
        } catch (\Exception $e) {
            \Log::error('Error en backup directo', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            
            return response()->json([
                'message' => 'Error en backup directo',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar registro de backup con información del archivo generado
     */
    private function updateBackupRecord(Backup $backup)
    {
        try {
            \Log::info('Buscando archivo de backup generado', [
                'backup_id' => $backup->id,
                'backup_created_at' => $backup->created_at
            ]);
            
            // Buscar archivos en el directorio de backups
            $backupDisk = Storage::disk(config('backup.backup.destination.disks')[0]);
            $backupPath = config('backup.backup.name');
            
            \Log::info('Configuración de backup', [
                'backup_disk' => get_class($backupDisk),
                'backup_path' => $backupPath
            ]);
            
            // Obtener timestamp del backup para buscar archivos creados después
            $backupTimestamp = $backup->created_at->timestamp;
            
            // Listar archivos y filtrar por fecha de modificación
            $files = collect($backupDisk->allFiles($backupPath))
                ->filter(function ($file) {
                    return str_ends_with($file, '.zip');
                })
                ->filter(function ($file) use ($backupDisk, $backupTimestamp) {
                    $fileModified = $backupDisk->lastModified($file);
                    // Solo archivos modificados después de crear el registro (con margen de 30 segundos)
                    return $fileModified >= ($backupTimestamp - 30);
                })
                ->sortByDesc(function ($file) use ($backupDisk) {
                    return $backupDisk->lastModified($file);
                });
            
            \Log::info('Archivos encontrados después del timestamp', [
                'backup_timestamp' => $backupTimestamp,
                'backup_datetime' => date('Y-m-d H:i:s', $backupTimestamp),
                'total_files' => $files->count(),
                'files' => $files->map(function($file) use ($backupDisk) {
                    return [
                        'file' => $file,
                        'modified' => date('Y-m-d H:i:s', $backupDisk->lastModified($file)),
                        'size' => $backupDisk->size($file)
                    ];
                })->values()->toArray()
            ]);
            
            if ($files->isNotEmpty()) {
                $latestFile = $files->first();
                $fileSize = $backupDisk->size($latestFile);
                $fileName = basename($latestFile);
                
                \Log::info('Archivo más reciente encontrado para el backup', [
                    'backup_id' => $backup->id,
                    'file_path' => $latestFile,
                    'file_name' => $fileName,
                    'file_size' => $fileSize,
                    'file_modified' => date('Y-m-d H:i:s', $backupDisk->lastModified($latestFile))
                ]);
                
                // Actualizar registro
                $backup->update([
                    'filename' => $fileName,
                    'file_path' => $latestFile,
                    'file_size' => $fileSize,
                    'status' => 'completed'
                ]);
                
                \Log::info('Registro de backup actualizado exitosamente', [
                    'backup_id' => $backup->id,
                    'final_data' => $backup->fresh()->toArray()
                ]);
            } else {
                \Log::warning('No se encontraron archivos de backup creados para este registro', [
                    'backup_id' => $backup->id,
                    'backup_timestamp' => $backupTimestamp,
                    'search_after' => date('Y-m-d H:i:s', $backupTimestamp - 30)
                ]);
                
                $backup->update([
                    'status' => 'failed',
                    'error_message' => 'No se generó archivo de backup en el tiempo esperado'
                ]);
            }
            
        } catch (\Exception $e) {
            \Log::error('Error actualizando registro de backup', [
                'backup_id' => $backup->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            $backup->update([
                'status' => 'failed',
                'error_message' => 'Error actualizando registro: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Crear backup manual usando pg_dump directamente
     */
    private function createManualBackup(Backup $backup, $storageDisk = null)
    {
        try {
            \Log::info('Iniciando backup manual', [
                'backup_id' => $backup->id,
                'storage_disk' => $storageDisk
            ]);
            
            // Determinar disco de almacenamiento
            $storageDisk = $storageDisk ?: config('backup.backup_storage_disk', 'local');
            
            // Obtener configuración de la base de datos
            $host = config('database.connections.pgsql.host');
            $port = config('database.connections.pgsql.port');
            $database = config('database.connections.pgsql.database');
            $username = config('database.connections.pgsql.username');
            $password = config('database.connections.pgsql.password');
            
            // Crear archivo temporal SQL
            $tempSqlFile = storage_path('app/' . $backup->filename . '.sql');
            
            // Determinar ubicación final según el disco
            if ($storageDisk === 'google') {
                $finalZipFile = storage_path('app/temp_' . $backup->filename);
                $finalPath = 'backups/' . $backup->filename; // Ruta en Google Drive
            } else {
                $finalZipFile = storage_path('app/Laravel/' . $backup->filename);
                $finalPath = 'Laravel/' . $backup->filename; // Ruta local
                
                // Asegurar que el directorio Laravel existe
                $laravelDir = storage_path('app/Laravel');
                if (!is_dir($laravelDir)) {
                    mkdir($laravelDir, 0755, true);
                }
            }
            
            \Log::info('Configuración para backup manual', [
                'host' => $host,
                'port' => $port,
                'database' => $database,
                'username' => $username,
                'temp_sql_file' => $tempSqlFile,
                'final_zip_file' => $finalZipFile,
                'final_path' => $finalPath,
                'storage_disk' => $storageDisk
            ]);
            
            // Configurar variable de entorno para password
            putenv("PGPASSWORD={$password}");
            
            // Comando pg_dump
            $pgDumpPath = config('database.connections.pgsql.dump.dump_binary_path', 'C:\\Program Files\\PostgreSQL\\15\\bin');
            $command = sprintf(
                '"%s\\pg_dump.exe" --host=%s --port=%s --username=%s --dbname=%s --no-owner --no-acl --file=%s',
                $pgDumpPath,
                escapeshellarg($host),
                escapeshellarg($port),
                escapeshellarg($username),
                escapeshellarg($database),
                escapeshellarg($tempSqlFile)
            );
            
            \Log::info('Ejecutando comando pg_dump', ['command' => $command]);
            
            // Ejecutar comando
            $output = [];
            $exitCode = null;
            exec($command . ' 2>&1', $output, $exitCode);
            
            // Limpiar variable de entorno
            putenv("PGPASSWORD");
            
            \Log::info('Resultado pg_dump', [
                'exit_code' => $exitCode,
                'output' => $output,
                'sql_file_exists' => file_exists($tempSqlFile),
                'sql_file_size' => file_exists($tempSqlFile) ? filesize($tempSqlFile) : 0
            ]);
            
            if ($exitCode !== 0 || !file_exists($tempSqlFile) || filesize($tempSqlFile) === 0) {
                $backup->update([
                    'status' => 'failed',
                    'error_message' => 'pg_dump falló: ' . implode(' ', $output)
                ]);
                
                return [
                    'success' => false,
                    'error' => 'pg_dump falló: ' . implode(' ', $output)
                ];
            }
            
            // Crear archivo ZIP
            $zip = new \ZipArchive();
            $zipResult = $zip->open($finalZipFile, \ZipArchive::CREATE | \ZipArchive::OVERWRITE);
            
            if ($zipResult !== TRUE) {
                $backup->update([
                    'status' => 'failed',
                    'error_message' => 'No se pudo crear archivo ZIP'
                ]);
                
                return [
                    'success' => false,
                    'error' => 'No se pudo crear archivo ZIP: ' . $zipResult
                ];
            }
            
            // Obtener tamaño del archivo SQL antes de agregarlo al ZIP
            $sqlFileSize = filesize($tempSqlFile);
            
            // Agregar el archivo SQL al ZIP
            $zip->addFile($tempSqlFile, basename($tempSqlFile));
            $zip->close();
            
            // Eliminar archivo SQL temporal
            unlink($tempSqlFile);
            
            // Verificar que el ZIP se creó correctamente
            if (!file_exists($finalZipFile) || filesize($finalZipFile) === 0) {
                $backup->update([
                    'status' => 'failed',
                    'error_message' => 'Archivo ZIP no se creó correctamente'
                ]);
                
                return [
                    'success' => false,
                    'error' => 'Archivo ZIP no se creó correctamente'
                ];
            }
            
            $fileSize = filesize($finalZipFile);
            
            // Subir a Google Drive si es necesario
            if ($storageDisk === 'google') {
                try {
                    \Log::info('Subiendo backup a Google Drive', [
                        'backup_id' => $backup->id,
                        'file_size' => $fileSize
                    ]);
                    
                    $googleDisk = \Storage::disk('google');
                    $fileContent = file_get_contents($finalZipFile);
                    
                    // Subir archivo a Google Drive
                    $googleDisk->put($finalPath, $fileContent);
                    
                    // Eliminar archivo temporal local
                    unlink($finalZipFile);
                    
                    \Log::info('Backup subido exitosamente a Google Drive', [
                        'backup_id' => $backup->id,
                        'google_drive_path' => $finalPath
                    ]);
                    
                } catch (\Exception $e) {
                    \Log::error('Error subiendo a Google Drive', [
                        'backup_id' => $backup->id,
                        'error' => $e->getMessage()
                    ]);
                    
                    $backup->update([
                        'status' => 'failed',
                        'error_message' => 'Error subiendo a Google Drive: ' . $e->getMessage()
                    ]);
                    
                    return [
                        'success' => false,
                        'error' => 'Error subiendo a Google Drive: ' . $e->getMessage()
                    ];
                }
            }
            
            // Actualizar registro del backup
            $backup->update([
                'file_path' => $finalPath,
                'file_size' => $fileSize,
                'status' => 'completed',
                'storage_disk' => $storageDisk
            ]);
            
            \Log::info('Backup manual completado exitosamente', [
                'backup_id' => $backup->id,
                'file_size' => $fileSize,
                'storage_disk' => $storageDisk,
                'file_path' => $finalPath
            ]);
            
            return [
                'success' => true,
                'details' => [
                    'file_size' => $fileSize,
                    'sql_dump_size' => $sqlFileSize,
                    'storage_disk' => $storageDisk,
                    'pg_dump_output' => $output
                ]
            ];
            
        } catch (\Exception $e) {
            \Log::error('Error en backup manual', [
                'backup_id' => $backup->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            $backup->update([
                'status' => 'failed',
                'error_message' => 'Error interno: ' . $e->getMessage()
            ]);
            
            return [
                'success' => false,
                'error' => 'Error interno: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Limpiar backups antiguos
     */
    public function cleanup(Request $request)
    {
        $request->validate([
            'keep_days' => 'integer|min:1|max:365'
        ]);

        $keepDays = $request->get('keep_days', 30);

        try {
            Artisan::call('backup:clean', [
                '--disable-notifications' => true
            ]);

            // También limpiar registros en nuestra tabla
            $oldBackups = Backup::where('created_at', '<', now()->subDays($keepDays))->get();
            $deletedCount = $oldBackups->count();

            foreach ($oldBackups as $backup) {
                $backup->delete();
            }

            // Log de actividad
            \Log::info('Limpieza de backups completada', [
                'deleted_count' => $deletedCount, 
                'keep_days' => $keepDays,
                'user_id' => Auth::id()
            ]);

            return response()->json([
                'message' => "Limpieza completada: {$deletedCount} backups eliminados",
                'deleted_count' => $deletedCount
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error en la limpieza de backups',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
