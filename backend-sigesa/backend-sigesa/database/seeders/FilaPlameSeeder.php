<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FilaPlameSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Limpiar filas existentes
        DB::table('fila_plames')->truncate();
        
        // Obtener todas las modalidades para asociar las filas
        $modalidades = DB::table('modalidades')->get();
        
        // Definir filas específicas para cada modalidad
        $filasPorModalidad = [
            'ARCU-SUR' => [
                'Contexto Institucional',
                'Proyecto Académico', 
                'Comunidad Universitaria',
                'Infraestructura'
            ],
            'CEUB' => [
                'Normas Juridicas Institucionales',
                'Misión y Objetivo', 
                'Currículo',
                'Administración y gestión académica',
                'Docentes',
                'Estudiantes',
                'Investigación e interacción social',
                'Recursos educativos',
                'Administrativos financieros',
                'Infraestructura'
            ]
        ];

        foreach ($modalidades as $modalidad) {
            // Determinar qué filas usar según el nombre de la modalidad
            $filasAUsar = [];
            
            if (stripos($modalidad->nombre_modalidad, 'ARCU') !== false || stripos($modalidad->nombre_modalidad, 'SUR') !== false) {
                $filasAUsar = $filasPorModalidad['ARCU-SUR'];
            } elseif (stripos($modalidad->nombre_modalidad, 'CEUB') !== false) {
                $filasAUsar = $filasPorModalidad['CEUB'];
            } else {
                // Por defecto usar CEUB si no se identifica la modalidad
                $filasAUsar = $filasPorModalidad['CEUB'];
            }

            foreach ($filasAUsar as $nombreFila) {
                DB::table('fila_plames')->insert([
                    'nombre_fila_plame' => $nombreFila,
                    'id_modalidad' => $modalidad->id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}
