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
                'codigo_facultad' => 'FCyT',
                'pagina_facultad' => 'https://fcyt.umss.edu.bo',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre_facultad' => 'Facultad de Medicina',
                'codigo_facultad' => 'FM',
                'pagina_facultad' => 'https://medicina.umss.edu.bo',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre_facultad' => 'Facultad de Derecho',
                'codigo_facultad' => 'FD',
                'pagina_facultad' => 'https://derecho.umss.edu.bo',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre_facultad' => 'Facultad de Ciencias Económicas',
                'codigo_facultad' => 'FCE',
                'pagina_facultad' => 'https://economia.umss.edu.bo',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre_facultad' => 'Facultad de Arquitectura y Ciencias del Hábitat',
                'codigo_facultad' => 'FACH',
                'pagina_facultad' => 'https://arquitectura.umss.edu.bo',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre_facultad' => 'Facultad de Ciencias Agrícolas y Pecuarias',
                'codigo_facultad' => 'FCAP',
                'pagina_facultad' => 'https://agronomia.umss.edu.bo',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre_facultad' => 'Facultad de Humanidades y Ciencias de la Educación',
                'codigo_facultad' => 'FHCE',
                'pagina_facultad' => 'https://humanidades.umss.edu.bo',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre_facultad' => 'Facultad de Ciencias Químicas',
                'codigo_facultad' => 'FCQ',
                'pagina_facultad' => 'https://quimicas.umss.edu.bo',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre_facultad' => 'Facultad de Odontología',
                'codigo_facultad' => 'FO',
                'pagina_facultad' => 'https://odontologia.umss.edu.bo',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre_facultad' => 'Facultad de Bioquímica y Farmacia',
                'codigo_facultad' => 'FBF',
                'pagina_facultad' => 'https://bioquimica.umss.edu.bo',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre_facultad' => 'Facultad de Enfermería',
                'codigo_facultad' => 'FE',
                'pagina_facultad' => 'https://enfermeria.umss.edu.bo',
                'created_at' => now(),
                'updated_at' => now(),
            ],
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
