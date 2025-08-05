<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class TestGoogleDriveCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'backup:test-google-drive';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Probar la configuración de Google Drive para backups';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $this->info('Probando configuración de Google Drive...');

        try {
            // Verificar configuración
            $clientId = config('filesystems.disks.google.clientId');
            $clientSecret = config('filesystems.disks.google.clientSecret');
            $refreshToken = config('filesystems.disks.google.refreshToken');
            $folderId = config('filesystems.disks.google.folderId');

            if (!$clientId || !$clientSecret || !$refreshToken) {
                $this->error('❌ Configuración incompleta de Google Drive');
                $this->line('Verifica que tienes configurado:');
                $this->line('- GOOGLE_DRIVE_CLIENT_ID');
                $this->line('- GOOGLE_DRIVE_CLIENT_SECRET');
                $this->line('- GOOGLE_DRIVE_REFRESH_TOKEN');
                return 1;
            }

            $this->info('✅ Configuración encontrada:');
            $this->line("Client ID: " . substr($clientId, 0, 20) . "...");
            $this->line("Client Secret: " . substr($clientSecret, 0, 10) . "...");
            $this->line("Refresh Token: " . substr($refreshToken, 0, 20) . "...");
            $this->line("Folder ID: " . ($folderId ?: 'Root folder'));

            // Probar conexión
            $this->info('Probando conexión...');
            
            $googleDisk = Storage::disk('google');
            
            // Crear archivo de prueba
            $testContent = 'Prueba de conexión SIGESA - ' . now()->toDateTimeString();
            $testFile = 'test_' . time() . '.txt';
            
            $this->info("Creando archivo de prueba: {$testFile}");
            $googleDisk->put($testFile, $testContent);
            
            // Verificar que existe
            if ($googleDisk->exists($testFile)) {
                $this->info('✅ Archivo creado exitosamente');
                
                // Leer contenido
                $content = $googleDisk->get($testFile);
                if ($content === $testContent) {
                    $this->info('✅ Contenido verificado correctamente');
                } else {
                    $this->error('❌ Error: Contenido no coincide');
                }
                
                // Eliminar archivo de prueba
                $googleDisk->delete($testFile);
                $this->info('✅ Archivo de prueba eliminado');
                
            } else {
                $this->error('❌ Error: No se pudo crear el archivo');
                return 1;
            }

            $this->info('');
            $this->info('🎉 Configuración de Google Drive funcionando correctamente!');
            $this->info('Ya puedes crear backups con storage_disk=google');
            
            return 0;

        } catch (\Exception $e) {
            $this->error('❌ Error de conexión: ' . $e->getMessage());
            $this->line('');
            $this->line('Posibles soluciones:');
            $this->line('1. Verifica que las credenciales sean correctas');
            $this->line('2. Asegúrate de que la API de Google Drive esté habilitada');
            $this->line('3. Verifica que el refresh token sea válido');
            $this->line('4. Consulta el archivo GOOGLE_DRIVE_SETUP.md para más detalles');
            
            return 1;
        }
    }
}
