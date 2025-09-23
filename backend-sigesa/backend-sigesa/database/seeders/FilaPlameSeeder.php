<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FilaPlameSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Obtener todas las modalidades para asociar las filas
        $modalidades = DB::table('modalidades')->get();
        
        $filasBase = [
            'Planificación',
            'Organización', 
            'Dirección',
            'Coordinación',
            'Control'
        ];

        foreach ($modalidades as $modalidad) {
            foreach ($filasBase as $nombreFila) {
                DB::table('fila_plames')->insert([
                    'nombre_fila_plame' => $nombreFila,
                    'id_modalidad' => $modalidad->id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}
