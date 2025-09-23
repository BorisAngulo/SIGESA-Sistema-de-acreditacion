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
        $columnas = [
            'Eficiencia',
            'Eficacia', 
            'Efectividad',
            'Productividad',
            'Calidad',
            'Innovación'
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
