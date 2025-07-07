<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        // Ejecutar seeders en orden
        $this->call([
            FacultadSeeder::class,
            CarreraSeeder::class,
            // ModalidadSeeder::class, // Descomenta cuando lo crees
        ]);

        $this->command->info('🎉 Base de datos poblada exitosamente!');
    }
}
