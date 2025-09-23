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
            ModalidadSeeder::class,
            AcreditacionesSeeder::class, // Nuevo seeder para acreditaciones
            RoleSeeder::class,
            UserSeeder::class,
            // Seeders para análisis FODA y PLAME
            CategoriaFodaSeeder::class,
            EstrategiaFodaSeeder::class,
            FilaPlameSeeder::class,
            ColumnaPlameSeeder::class,
        ]);

        $this->command->info('🎉 Base de datos poblada exitosamente!');
    }
}
