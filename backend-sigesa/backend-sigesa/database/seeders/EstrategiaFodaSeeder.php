<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EstrategiaFodaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $estrategias = [
            [
                'codigo_estrategia_foda' => 'FO',
                'nombre_estrategia_foda' => 'Fortalezas-Oportunidades',
                'descripcion_estrategia_foda' => 'Estrategias que utilizan las fortalezas internas para aprovechar las oportunidades externas',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'codigo_estrategia_foda' => 'FA',
                'nombre_estrategia_foda' => 'Fortalezas-Amenazas',
                'descripcion_estrategia_foda' => 'Estrategias que utilizan las fortalezas internas para minimizar el impacto de las amenazas externas',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'codigo_estrategia_foda' => 'DO',
                'nombre_estrategia_foda' => 'Debilidades-Oportunidades',
                'descripcion_estrategia_foda' => 'Estrategias que superan las debilidades internas aprovechando las oportunidades externas',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'codigo_estrategia_foda' => 'DA',
                'nombre_estrategia_foda' => 'Debilidades-Amenazas',
                'descripcion_estrategia_foda' => 'Estrategias defensivas que minimizan las debilidades internas y evitan las amenazas externas',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('estrategia_fodas')->insert($estrategias);
    }
}
