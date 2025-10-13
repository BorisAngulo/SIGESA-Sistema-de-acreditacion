<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ColumnaPlameSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Limpiar columnas existentes
        DB::table('columna_plames')->truncate();
        
        $columnas = [
            'Objetivo',
            'Producto', 
            'Actividades',
            'Indicador',
            'Validez indicador',
            'Resultado esperado',
            'Resultado alcanzado (carrera)',
            'Resultado alcanzado (DUEA)',
            'Costo esperado',
            'Costo alcanzado',
            'Tiempo esperado',
            'Tiempo alcanzado',
        ];

        foreach ($columnas as $nombreColumna) {
            DB::table('columna_plames')->insert([
                'nombre_columna_plame' => $nombreColumna,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
