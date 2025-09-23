<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategoriaFodaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $categorias = [
            [
                'nombre_categoria_foda' => 'Fortalezas',
                'codigo_categoria_foda' => 'F',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre_categoria_foda' => 'Oportunidades',
                'codigo_categoria_foda' => 'O',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre_categoria_foda' => 'Debilidades',
                'codigo_categoria_foda' => 'D',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre_categoria_foda' => 'Amenazas',
                'codigo_categoria_foda' => 'A',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('categoria_fodas')->insert($categorias);
    }
}
