<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Carrera;
use App\Models\Facultad;
use Illuminate\Support\Facades\DB;

class CarreraSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Limpiar la tabla antes de insertar (opcional)
        DB::table('carreras')->truncate();

        // Obtener las facultades para asignar IDs
        $fcyt = Facultad::where('codigo_facultad', 'FCyT')->first();
        $fm = Facultad::where('codigo_facultad', 'FM')->first();
        $fd = Facultad::where('codigo_facultad', 'FD')->first();
        $fce = Facultad::where('codigo_facultad', 'FCE')->first();
        $fach = Facultad::where('codigo_facultad', 'FACH')->first();
        $fcap = Facultad::where('codigo_facultad', 'FCAP')->first();
        $fhce = Facultad::where('codigo_facultad', 'FHCE')->first();
        $fcq = Facultad::where('codigo_facultad', 'FCQ')->first();
        $fo = Facultad::where('codigo_facultad', 'FO')->first();
        $fbf = Facultad::where('codigo_facultad', 'FBF')->first();
        $fe = Facultad::where('codigo_facultad', 'FE')->first();

        $carreras = [];

        // Carreras de Ciencias y Tecnología
        if ($fcyt) {
            $carreras = array_merge($carreras, [
                [
                    'facultad_id' => $fcyt->id,
                    'codigo_carrera' => 'INGSIS',
                    'nombre_carrera' => 'Ingeniería de Sistemas',
                    'pagina_carrera' => 'https://cs.umss.edu.bo',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'facultad_id' => $fcyt->id,
                    'codigo_carrera' => 'INGCIV',
                    'nombre_carrera' => 'Ingeniería Civil',
                    'pagina_carrera' => 'https://civil.umss.edu.bo',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'facultad_id' => $fcyt->id,
                    'codigo_carrera' => 'INGELEC',
                    'nombre_carrera' => 'Ingeniería Eléctrica',
                    'pagina_carrera' => 'https://electrica.umss.edu.bo',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'facultad_id' => $fcyt->id,
                    'codigo_carrera' => 'INGMEC',
                    'nombre_carrera' => 'Ingeniería Mecánica',
                    'pagina_carrera' => 'https://mecanica.umss.edu.bo',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'facultad_id' => $fcyt->id,
                    'codigo_carrera' => 'INGIND',
                    'nombre_carrera' => 'Ingeniería Industrial',
                    'pagina_carrera' => 'https://industrial.umss.edu.bo',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'facultad_id' => $fcyt->id,
                    'codigo_carrera' => 'MATFIS',
                    'nombre_carrera' => 'Matemática y Física',
                    'pagina_carrera' => 'https://matematicas.umss.edu.bo',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);
        }

        // Carreras de Medicina
        if ($fm) {
            $carreras = array_merge($carreras, [
                [
                    'facultad_id' => $fm->id,
                    'codigo_carrera' => 'MED',
                    'nombre_carrera' => 'Medicina',
                    'pagina_carrera' => 'https://medicina.umss.edu.bo',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);
        }

        // Carreras de Derecho
        if ($fd) {
            $carreras = array_merge($carreras, [
                [
                    'facultad_id' => $fd->id,
                    'codigo_carrera' => 'DER',
                    'nombre_carrera' => 'Derecho',
                    'pagina_carrera' => 'https://derecho.umss.edu.bo',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);
        }

        // Carreras de Ciencias Económicas
        if ($fce) {
            $carreras = array_merge($carreras, [
                [
                    'facultad_id' => $fce->id,
                    'codigo_carrera' => 'ECON',
                    'nombre_carrera' => 'Economía',
                    'pagina_carrera' => 'https://economia.umss.edu.bo',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'facultad_id' => $fce->id,
                    'codigo_carrera' => 'CONT',
                    'nombre_carrera' => 'Contaduría Pública',
                    'pagina_carrera' => 'https://contaduria.umss.edu.bo',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'facultad_id' => $fce->id,
                    'codigo_carrera' => 'ADM',
                    'nombre_carrera' => 'Administración de Empresas',
                    'pagina_carrera' => 'https://administracion.umss.edu.bo',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);
        }

        // Carreras de Arquitectura
        if ($fach) {
            $carreras = array_merge($carreras, [
                [
                    'facultad_id' => $fach->id,
                    'codigo_carrera' => 'ARQ',
                    'nombre_carrera' => 'Arquitectura',
                    'pagina_carrera' => 'https://arquitectura.umss.edu.bo',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);
        }

        // Carreras de Ciencias Agrícolas
        if ($fcap) {
            $carreras = array_merge($carreras, [
                [
                    'facultad_id' => $fcap->id,
                    'codigo_carrera' => 'AGR',
                    'nombre_carrera' => 'Ingeniería Agronómica',
                    'pagina_carrera' => 'https://agronomia.umss.edu.bo',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'facultad_id' => $fcap->id,
                    'codigo_carrera' => 'VET',
                    'nombre_carrera' => 'Medicina Veterinaria y Zootecnia',
                    'pagina_carrera' => 'https://veterinaria.umss.edu.bo',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);
        }

        // Insertar todas las carreras
        foreach ($carreras as $carrera) {
            Carrera::create($carrera);
        }

        $this->command->info('Carreras de la UMSS creadas exitosamente!');
    }
}
