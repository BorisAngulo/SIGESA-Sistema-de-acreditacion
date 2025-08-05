<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use App\Models\Backup;
use Carbon\Carbon;

class SyncExistingBackups extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'backup:sync';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sincronizar archivos de backup existentes con la base de datos';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Sincronizando backups existentes...');

        // Buscar archivos de backup en el directorio de storage
        $backupFiles = collect(Storage::allFiles())
            ->filter(function ($file) {
                return str_contains($file, '.zip') || str_contains($file, '.gz');
            })
            ->filter(function ($file) {
                // Filtrar archivos que parecen ser backups (contienen fechas)
                return preg_match('/\d{4}-\d{2}-\d{2}/', basename($file));
            });

        $syncedCount = 0;

        foreach ($backupFiles as $file) {
            $filename = basename($file);
            
            // Verificar si ya existe en la base de datos
            $existingBackup = Backup::where('filename', $filename)
                ->orWhere('file_path', $file)
                ->first();

            if (!$existingBackup) {
                // Extraer fecha del nombre del archivo
                $fileDate = $this->extractDateFromFilename($file);
                
                Backup::create([
                    'filename' => $filename,
                    'file_path' => $file,
                    'file_size' => Storage::size($file),
                    'backup_type' => 'manual', // Usar manual por ahora
                    'status' => 'completed',
                    'completed_at' => $fileDate,
                    'created_at' => $fileDate,
                    'updated_at' => $fileDate,
                ]);

                $syncedCount++;
                $this->line("Sincronizado: {$filename}");
            }
        }

        $this->info("Sincronización completada. {$syncedCount} backups agregados a la base de datos.");

        return Command::SUCCESS;
    }

    /**
     * Extraer fecha del nombre del archivo
     */
    private function extractDateFromFilename($filepath)
    {
        $filename = basename($filepath);
        
        // Buscar patrones de fecha en el nombre del archivo
        if (preg_match('/(\d{4}-\d{2}-\d{2})/', $filename, $matches)) {
            return Carbon::createFromFormat('Y-m-d', $matches[1]);
        }

        // Si no se puede extraer la fecha, usar la fecha de modificación del archivo
        return Carbon::createFromTimestamp(Storage::lastModified($filepath));
    }
}
