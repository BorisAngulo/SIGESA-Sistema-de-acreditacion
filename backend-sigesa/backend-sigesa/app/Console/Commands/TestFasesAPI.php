<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Fase;
use App\Models\SubFase;

class TestFasesAPI extends Command
{
    protected $signature = 'test:fases-api';
    protected $description = 'Test fases API functionality';

    public function handle()
    {
        $this->info('=== TESTING FASES API ===');
        
        // Verificar que podemos consultar fases
        $totalFases = Fase::count();
        $this->info("Total fases en BD: {$totalFases}");
        
        if ($totalFases > 0) {
            $this->info("Primeras 3 fases:");
            $fases = Fase::take(3)->get();
            foreach ($fases as $fase) {
                $this->info("- ID: {$fase->id} | Nombre: {$fase->nombre_fase} | Número: {$fase->numero_fase}");
            }
        }
        
        // Verificar subfases
        $totalSubfases = SubFase::count();
        $this->info("Total subfases en BD: {$totalSubfases}");
        
        if ($totalSubfases > 0) {
            $this->info("Primeras 3 subfases:");
            $subfases = SubFase::take(3)->get();
            foreach ($subfases as $subfase) {
                $this->info("- ID: {$subfase->id} | Nombre: {$subfase->nombre_subfase} | Número: {$subfase->numero_subfase}");
            }
        }
        
        // Verificar relaciones
        if ($totalFases > 0) {
            $fase = Fase::first();
            $subfasesCount = $fase->subfases()->count();
            $this->info("La primera fase tiene {$subfasesCount} subfases");
        }
        
        $this->info("✅ Las consultas de fases y subfases funcionan correctamente");
        
        return 0;
    }
}
