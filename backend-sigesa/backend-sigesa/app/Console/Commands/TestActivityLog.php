<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\ActivityLog;
use App\Models\Facultad;
use App\Models\Carrera;
use App\Models\Modalidad;
use App\Models\CarreraModalidad;
use App\Models\Fase;
use App\Models\SubFase;
use App\Models\Documento;

class TestActivityLog extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:activity-log {--diagnose : Solo diagnosticar logs existentes} {--delete-test : Probar eliminación con usuario} {--full-test : Probar todos los modelos}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test activity logging functionality';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $this->info('=== TESTING ACTIVITY LOGS ===');
        
        // Si es solo diagnóstico, solo mostrar logs existentes
        if ($this->option('diagnose')) {
            return $this->diagnoseExistingLogs();
        }
        
        // Si es prueba de eliminación
        if ($this->option('delete-test')) {
            return $this->testDeleteWithUser();
        }
        
        // Si es prueba completa de todos los modelos
        if ($this->option('full-test')) {
            return $this->testAllModelsWithUser();
        }
        
        // Autenticar como el primer usuario disponible para las pruebas
        $user = \App\Models\User::first();
        if ($user) {
            \Illuminate\Support\Facades\Auth::setUser($user);
            $this->info("Autenticado como: {$user->name} {$user->lastName}");
        } else {
            $this->info("No hay usuarios en la base de datos - creando logs sin usuario");
        }
        
        // Mostrar logs existentes
        $totalLogs = ActivityLog::count();
        $this->info("Total logs en base de datos: {$totalLogs}");
        
        if ($totalLogs > 0) {
            $this->info("Últimos 5 logs:");
            $recentLogs = ActivityLog::with('user')
                ->orderBy('created_at', 'desc')
                ->take(5)
                ->get();
            
            foreach ($recentLogs as $log) {
                $userName = $log->user ? $log->user->name : 'Sistema';
                $this->info("- {$log->action}: {$log->description} ({$log->model_type}) - {$log->created_at}");
            }
        }

        $timestamp = now()->format('His'); // Solo hora, minutos, segundos para mantenerlo corto
        $microseconds = substr(microtime(), 2, 3); // Agregar microsegundos para unicidad
        $uniqueId = $timestamp . $microseconds;
        
        $this->info("=== CREANDO FACULTAD DE PRUEBA ===");
        $facultad = Facultad::create([
            'nombre_facultad' => 'Facultad Test ' . $uniqueId,
            'codigo_facultad' => 'TEST' . substr($uniqueId, 0, 6), // Máximo 10 caracteres: TEST + 6 dígitos
            'pagina_facultad' => 'http://test.com'
        ]);
        $this->info("Facultad creada: {$facultad->nombre_facultad}");

        $this->info("=== CREANDO CARRERA DE PRUEBA ===");
        $carrera = Carrera::create([
            'codigo_carrera' => 'CAR' . $uniqueId,
            'nombre_carrera' => 'Carrera Test ' . $uniqueId,
            'pagina_carrera' => 'http://carrera-test.com',
            'facultad_id' => $facultad->id
        ]);
        $this->info("Carrera creada: {$carrera->nombre_carrera}");

        $this->info("=== CREANDO MODALIDAD DE PRUEBA ===");
        $modalidad = Modalidad::create([
            'codigo_modalidad' => 'MOD' . substr($uniqueId, 0, 7), // Máximo 10 caracteres
            'nombre_modalidad' => 'Modalidad Test ' . $uniqueId,
            'descripcion_modalidad' => 'Descripción de prueba'
        ]);
        $this->info("Modalidad creada: {$modalidad->nombre_modalidad}");

        $this->info("=== CREANDO CARRERA-MODALIDAD DE PRUEBA ===");
        $carreraModalidad = CarreraModalidad::create([
            'carrera_id' => $carrera->id,
            'modalidad_id' => $modalidad->id,
            'fecha_ini_vig' => now(),
            'fecha_fin_vig' => now()->addYear(),
            'duracion_anios' => 4,
            'duracion_periodos' => 8,
            'numero_creditos' => 240,
            'certificado' => 'Certificado Test'
        ]);
        $this->info("CarreraModalidad creada: ID {$carreraModalidad->id}");

        $this->info("=== CREANDO FASE DE PRUEBA ===");
        $fase = Fase::create([
            'carrera_modalidad_id' => $carreraModalidad->id,
            'numero_fase' => 1,
            'nombre_fase' => 'Fase Test ' . $uniqueId,
            'descripcion_fase' => 'Descripción de fase de prueba'
        ]);
        $this->info("Fase creada: {$fase->nombre_fase}");

        $this->info("=== CREANDO SUBFASE DE PRUEBA ===");
        $subfase = SubFase::create([
            'fase_id' => $fase->id,
            'numero_subfase' => 1,
            'nombre_subfase' => 'SubFase Test ' . $uniqueId,
            'descripcion_subfase' => 'Descripción de subfase de prueba'
        ]);
        $this->info("SubFase creada: {$subfase->nombre_subfase}");

        $this->info("=== CREANDO DOCUMENTO DE PRUEBA ===");
        $documento = Documento::create([
            'subfase_id' => $subfase->id,
            'nombre_documento' => 'Documento Test ' . $uniqueId,
            'descripcion_documento' => 'Descripción de documento de prueba',
            'tipo_documento' => '01', // Requerido: '01' para específicos, '02' para generales
            'tipo_mime' => 'application/pdf',
            'tamano_archivo' => 1024
        ]);
        $this->info("Documento creado: {$documento->nombre_documento}");

        // Actualizar algunos registros para probar update
        $this->info("=== ACTUALIZANDO REGISTROS ===");
        $facultad->update(['nombre_facultad' => 'Facultad Test Actualizada ' . $uniqueId]);
        $carrera->update(['nombre_carrera' => 'Carrera Test Actualizada ' . $uniqueId]);
        $modalidad->update(['nombre_modalidad' => 'Modalidad Test Actualizada ' . $uniqueId]);

        // Mostrar logs creados
        $this->info("=== LOGS CREADOS ===");
        $newLogs = ActivityLog::where('created_at', '>=', now()->subMinute())
            ->orderBy('created_at', 'desc')
            ->get();
        
        foreach ($newLogs as $log) {
            $this->info("- {$log->action}: {$log->description}");
        }

        $this->info("Total de nuevos logs creados: " . $newLogs->count());
        
        return 0;
    }
    
    private function diagnoseExistingLogs()
    {
        $this->info("=== DIAGNÓSTICO DE LOGS EXISTENTES ===");
        
        $totalLogs = ActivityLog::count();
        $this->info("Total logs en base de datos: {$totalLogs}");
        
        // Logs con usuario
        $logsWithUser = ActivityLog::whereNotNull('user_id')->count();
        $this->info("Logs con usuario: {$logsWithUser}");
        
        // Logs sin usuario
        $logsWithoutUser = ActivityLog::whereNull('user_id')->count();
        $this->info("Logs sin usuario: {$logsWithoutUser}");
        
        $this->info("\n=== ÚLTIMOS 10 LOGS DETALLADOS ===");
        $recentLogs = ActivityLog::with('user')
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get();
        
        foreach ($recentLogs as $log) {
            $userInfo = $log->user_id 
                ? ($log->user ? "{$log->user->name} {$log->user->lastName}" : "Usuario ID {$log->user_id} (no encontrado)")
                : "Sin usuario";
            
            $this->info("{$log->created_at} | User ID: " . ($log->user_id ?? 'NULL') . " | Usuario: {$userInfo} | {$log->action}: {$log->description}");
        }
        
        return 0;
    }
    
    private function testDeleteWithUser()
    {
        $this->info("=== PRUEBA DE ELIMINACIÓN CON USUARIO ===");
        
        // Autenticar usuario
        $user = \App\Models\User::first();
        if (!$user) {
            $this->error("No hay usuarios en la base de datos");
            return 1;
        }
        
        \Illuminate\Support\Facades\Auth::setUser($user);
        $this->info("Autenticado como: {$user->name} {$user->lastName}");
        
        // Crear una facultad de prueba
        $timestamp = now()->format('His');
        $facultad = Facultad::create([
            'nombre_facultad' => 'Facultad Para Eliminar ' . $timestamp,
            'codigo_facultad' => 'DEL' . substr($timestamp, 0, 7),
            'pagina_facultad' => 'http://delete-test.com'
        ]);
        $this->info("Facultad creada: {$facultad->nombre_facultad}");
        
        // Esperar un momento
        sleep(1);
        
        // Eliminar la facultad
        $facultad->delete();
        $this->info("Facultad eliminada: {$facultad->nombre_facultad}");
        
        // Verificar los logs más recientes
        $this->info("\n=== LOGS MÁS RECIENTES ===");
        $recentLogs = ActivityLog::with('user')
            ->where('created_at', '>=', now()->subMinutes(1))
            ->orderBy('created_at', 'desc')
            ->get();
        
        foreach ($recentLogs as $log) {
            $userInfo = $log->user_id 
                ? ($log->user ? "{$log->user->name} {$log->user->lastName}" : "Usuario ID {$log->user_id} (no encontrado)")
                : "Sin usuario";
            
            $this->info("{$log->created_at} | User ID: " . ($log->user_id ?? 'NULL') . " | Usuario: {$userInfo} | {$log->action}: {$log->description}");
        }
        
        return 0;
    }
    
    private function testAllModelsWithUser()
    {
        $this->info("=== PRUEBA COMPLETA DE TODOS LOS MODELOS ===");
        
        // Autenticar usuario
        $user = \App\Models\User::first();
        if (!$user) {
            $this->error("No hay usuarios en la base de datos");
            return 1;
        }
        
        \Illuminate\Support\Facades\Auth::setUser($user);
        $this->info("Autenticado como: {$user->name} {$user->lastName}");
        
        $timestamp = now()->format('His');
        $uniqueId = $timestamp . substr(microtime(), 2, 3);
        
        // Crear todos los modelos
        $this->info("\n=== CREANDO TODOS LOS MODELOS ===");
        
        // Facultad
        $facultad = Facultad::create([
            'nombre_facultad' => 'Test Full ' . $uniqueId,
            'codigo_facultad' => 'TF' . substr($uniqueId, 0, 8),
            'pagina_facultad' => 'http://test.com'
        ]);
        $this->info("✓ Facultad creada");
        
        // Carrera
        $carrera = Carrera::create([
            'codigo_carrera' => 'TFCAR' . $uniqueId,
            'nombre_carrera' => 'Carrera Test Full ' . $uniqueId,
            'facultad_id' => $facultad->id
        ]);
        $this->info("✓ Carrera creada");
        
        // Modalidad
        $modalidad = Modalidad::create([
            'codigo_modalidad' => 'TFM' . substr($uniqueId, 0, 7),
            'nombre_modalidad' => 'Modalidad Test Full ' . $uniqueId
        ]);
        $this->info("✓ Modalidad creada");
        
        // CarreraModalidad
        $carreraModalidad = CarreraModalidad::create([
            'carrera_id' => $carrera->id,
            'modalidad_id' => $modalidad->id,
            'fecha_ini_vig' => now(),
            'duracion_anios' => 4,
            'numero_creditos' => 240
        ]);
        $this->info("✓ CarreraModalidad creada");
        
        // Fase
        $fase = Fase::create([
            'carrera_modalidad_id' => $carreraModalidad->id,
            'numero_fase' => 1,
            'nombre_fase' => 'Fase Test Full ' . $uniqueId
        ]);
        $this->info("✓ Fase creada");
        
        // SubFase
        $subfase = SubFase::create([
            'fase_id' => $fase->id,
            'numero_subfase' => 1,
            'nombre_subfase' => 'SubFase Test Full ' . $uniqueId
        ]);
        $this->info("✓ SubFase creada");
        
        // Documento
        $documento = Documento::create([
            'subfase_id' => $subfase->id,
            'nombre_documento' => 'Documento Test Full ' . $uniqueId,
            'tipo_documento' => '01'
        ]);
        $this->info("✓ Documento creado");
        
        sleep(1);
        
        // Eliminar algunos para probar delete
        $this->info("\n=== ELIMINANDO ALGUNOS MODELOS ===");
        $documento->delete();
        $this->info("✓ Documento eliminado");
        
        $subfase->delete();
        $this->info("✓ SubFase eliminada");
        
        $fase->delete();
        $this->info("✓ Fase eliminada");
        
        // Verificar logs
        $this->info("\n=== LOGS GENERADOS ===");
        $recentLogs = ActivityLog::with('user')
            ->where('created_at', '>=', now()->subMinutes(2))
            ->orderBy('created_at', 'desc')
            ->get();
        
        foreach ($recentLogs as $log) {
            $userInfo = $log->user_id 
                ? ($log->user ? "{$log->user->name} {$log->user->lastName}" : "Usuario ID {$log->user_id} (no encontrado)")
                : "Sin usuario";
            
            $status = $log->user_id ? "✅" : "❌";
            $this->info("{$status} {$log->created_at} | Usuario: {$userInfo} | {$log->action}: {$log->description}");
        }
        
        $logsWithUser = $recentLogs->where('user_id', '!=', null)->count();
        $logsWithoutUser = $recentLogs->where('user_id', null)->count();
        
        $this->info("\n=== RESUMEN ===");
        $this->info("Logs con usuario: {$logsWithUser}");
        $this->info("Logs sin usuario: {$logsWithoutUser}");
        
        if ($logsWithoutUser > 0) {
            $this->error("❌ Algunos logs no tienen usuario asignado");
            return 1;
        } else {
            $this->info("✅ Todos los logs tienen usuario asignado correctamente");
            return 0;
        }
    }
}
