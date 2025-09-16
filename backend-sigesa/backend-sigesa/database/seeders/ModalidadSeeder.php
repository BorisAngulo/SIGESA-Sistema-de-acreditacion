<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

use App\Models\Modalidad;

class ModalidadSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Modalidad::create(['nombre_modalidad' => 'CEUB', 'codigo_modalidad' => "CEUB"]);
        Modalidad::create(['nombre_modalidad' => 'ARCUSUR', 'codigo_modalidad' => "ARCUSUR"]);
    }
}
