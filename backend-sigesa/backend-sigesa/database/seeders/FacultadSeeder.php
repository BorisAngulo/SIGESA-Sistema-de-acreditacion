<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Facultad;
use Illuminate\Support\Facades\DB;

class FacultadSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Limpiar la tabla antes de insertar (opcional)
        DB::table('facultades')->truncate();

        // Facultades reales de la Universidad Mayor de San Simón (UMSS)
        $facultades = [
            [
                'nombre_facultad' => 'Facultad de Ciencias y Tecnología',
                'codigo_facultad' => '20',
                'pagina_facultad' => 'https://fcyt.umss.edu.bo',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre_facultad' => 'Facultad de Medicina',
                'codigo_facultad' => '16',
                'pagina_facultad' => 'https://medicina.umss.edu.bo',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre_facultad' => 'Facultad de Ciencias Económicas',
                'codigo_facultad' => '13',
                'pagina_facultad' => 'https://economia.umss.edu.bo',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre_facultad' => 'Facultad de Arquitectura y Ciencias del Hábitat',
                'codigo_facultad' => '17',
                'pagina_facultad' => 'https://arquitectura.umss.edu.bo',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre_facultad' => 'Facultad de Ciencias Agrícolas y Pecuarias',
                'codigo_facultad' => '10',
                'pagina_facultad' => 'https://agronomia.umss.edu.bo',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre_facultad' => 'Facultad de Humanidades y Ciencias de la Educación',
                'codigo_facultad' => '18',
                'pagina_facultad' => 'https://humanidades.umss.edu.bo',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre_facultad' => 'Facultad de Odontología',
                'codigo_facultad' => '15',
                'pagina_facultad' => 'https://odontologia.umss.edu.bo',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre_facultad' => 'Facultad de Enfermería',
                'codigo_facultad' => '29',
                'pagina_facultad' => 'https://enfermeria.umss.edu.bo',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre_facultad' => 'Facultad de Ciencias Farmacéuticas y Bioquímicas',
                'codigo_facultad' => '12',
                'pagina_facultad' => 'https://aaaaa.umss.edu.bo',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre_facultad' => 'Facultad de Desarrollo Rural y Territorial',
                'codigo_facultad' => '14',
                'pagina_facultad' => 'https://aaaaa.umss.edu.bo',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre_facultad' => 'Facultad de Ciencias Jurídicas y Políticas',
                'codigo_facultad' => '19',
                'pagina_facultad' => 'https://aaaaa.umss.edu.bo',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre_facultad' => 'Facultad Politécnica del Valle Alto',
                'codigo_facultad' => '21',
                'pagina_facultad' => 'https://aaaaa.umss.edu.bo',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre_facultad' => 'Facultad de Ciencias Sociales',
                'codigo_facultad' => '23',
                'pagina_facultad' => 'https://aaaaa.umss.edu.bo',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre_facultad' => 'Facultad Unidad Académica Desconcentrada San Simón Tropico',
                'codigo_facultad' => '24',
                'pagina_facultad' => 'https://aaaaa.umss.edu.bo',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre_facultad' => 'Facultad Unidad Académica Desconcentrada San Simón Valle',
                'codigo_facultad' => '25',
                'pagina_facultad' => 'https://aaaaa.umss.edu.bo',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre_facultad' => 'Facultad Unidad Académica Desconcentrada San Simón Andina',
                'codigo_facultad' => '26',
                'pagina_facultad' => 'https://aaaaa.umss.edu.bo',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre_facultad' => 'Facultad de Ciencias Veterinarias',
                'codigo_facultad' => '27',
                'pagina_facultad' => 'https://aaaaa.umss.edu.bo',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ];

        // Insertar usando Eloquent (recomendado)
        foreach ($facultades as $facultad) {
            Facultad::create($facultad);
        }

        // Alternativa: Insertar usando DB::insert (más rápido para muchos registros)
        // DB::table('facultades')->insert($facultades);

        $this->command->info('Facultades de la UMSS creadas exitosamente!');
    }
}
