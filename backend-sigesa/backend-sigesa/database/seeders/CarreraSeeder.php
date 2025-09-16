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
        $c10 = Facultad::where('codigo_facultad', '10')->first();
        $c12 = Facultad::where('codigo_facultad', '12')->first();
        $c13 = Facultad::where('codigo_facultad', '13')->first();
        $c14 = Facultad::where('codigo_facultad', '14')->first();
        $c15 = Facultad::where('codigo_facultad', '15')->first();
        $c16 = Facultad::where('codigo_facultad', '16')->first();
        $c17 = Facultad::where('codigo_facultad', '17')->first();
        $c18 = Facultad::where('codigo_facultad', '18')->first();
        $c19 = Facultad::where('codigo_facultad', '19')->first();
        $c20 = Facultad::where('codigo_facultad', '20')->first();
        $c21 = Facultad::where('codigo_facultad', '21')->first();
        $c23 = Facultad::where('codigo_facultad', '23')->first();
        $c26 = Facultad::where('codigo_facultad', '26')->first();
        $c27 = Facultad::where('codigo_facultad', '27')->first();
        $c29 = Facultad::where('codigo_facultad', '29')->first();

        $carreras = [];

        // Carreras de Ciencias Agricolas y Pecuarias
        if ($c10) {
            $carreras = array_merge($carreras, [
                [
                    'facultad_id' => $c10->id,
                    'codigo_carrera' => '103020',
                    'nombre_carrera' => 'LIC. EN ING. AGR TROP MAN R. REN',
                    'pagina_carrera' => 'https://zzz.umss.edu.bo',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'facultad_id' => $c10->id,
                    'codigo_carrera' => '019701',
                    'nombre_carrera' => 'LIC. EN INGENIERIA AGRICOLA',
                    'pagina_carrera' => 'https://zzz.umss.edu.bo',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'facultad_id' => $c10->id,
                    'codigo_carrera' => '649701',
                    'nombre_carrera' => 'LIC. EN INGENIERIA FITOTECNISTA',
                    'pagina_carrera' => 'https://zzz.umss.edu.bo',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'facultad_id' => $c10->id,
                    'codigo_carrera' => '730602',
                    'nombre_carrera' => 'LIC. EN INGENIERIA FORESTAL',
                    'pagina_carrera' => 'https://zzz.umss.edu.bo',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'facultad_id' => $c10->id,
                    'codigo_carrera' => '770201',
                    'nombre_carrera' => 'LIC. INGENIERO AGRONOMO ZOOTECNISTA',
                    'pagina_carrera' => 'https://zzz.umss.edu.bo',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'facultad_id' => $c10->id,
                    'codigo_carrera' => '117071',
                    'nombre_carrera' => 'LICENCIATURA EN ING. AGROINDUSTRIAL',
                    'pagina_carrera' => 'https://zzz.umss.edu.bo',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'facultad_id' => $c10->id,
                    'codigo_carrera' => '718801',
                    'nombre_carrera' => 'LICENCIATURA EN INGENIERIA AGRONOMICA',
                    'pagina_carrera' => 'https://zzz.umss.edu.bo',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'facultad_id' => $c10->id,
                    'codigo_carrera' => '709701',
                    'nombre_carrera' => 'TEC. SUPERIOR EN MECANIZACION AGRICOLA',
                    'pagina_carrera' => 'https://zzz.umss.edu.bo',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);
        }

        // Carreras Ciencias Farmaceuticas y Bioquimicas
        if ($c12) {
            $carreras = array_merge($carreras, [
                [
                    'facultad_id' => $c12->id,
                    'codigo_carrera' => '049001',
                    'nombre_carrera' => 'LICENCIATURA EN BIOQUIMICA Y FARMACIA',
                    'pagina_carrera' => 'https://bioquimica.umss.edu.bo',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);
        }

        // Carreras Ciencias Ecónomicas
        if ($c13) {
            $carreras = array_merge($carreras, [
                [
                    'facultad_id' => $c13->id,
                    'codigo_carrera' => '109401',
                    'nombre_carrera' => 'LIC. EN ADMINISTRACION DE EMPRESAS',
                    'pagina_carrera' => 'https://empresas.umss.edu.bo',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'facultad_id' => $c13->id,
                    'codigo_carrera' => '089801',
                    'nombre_carrera' => 'LICENCIATURA EN CONTADURIA PUBLICA',
                    'pagina_carrera' => 'https://contaduria.umss.edu.bo',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'facultad_id' => $c13->id,
                    'codigo_carrera' => '059801',
                    'nombre_carrera' => 'LICENCIATURA EN ECONOMIA',
                    'pagina_carrera' => 'https://economia.umss.edu.bo',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'facultad_id' => $c13->id,
                    'codigo_carrera' => '125091',
                    'nombre_carrera' => 'LICENCIATURA EN INGENIERIA COMERCIAL',
                    'pagina_carrera' => 'https://comercial.umss.edu.bo',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'facultad_id' => $c13->id,
                    'codigo_carrera' => '126091',
                    'nombre_carrera' => 'LICENCIATURA EN INGENIERIA FINANCIERA',
                    'pagina_carrera' => 'https://finanzas.umss.edu.bo',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);
        }

        // Carreras de Desarrollo Rural y Territorial
        if ($c14) {
            $carreras = array_merge($carreras, [
                [
                    'facultad_id' => $c14->id,
                    'codigo_carrera' => '168201',
                    'nombre_carrera' => 'TECNICO SUPERIOR EN AGRONOMIA',
                    'pagina_carrera' => 'https://agronomia.umss.edu.bo',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);
        }

        // Carreras de Odontología
        if ($c15) {
            $carreras = array_merge($carreras, [
                [
                    'facultad_id' => $c15->id,
                    'codigo_carrera' => '179901',
                    'nombre_carrera' => 'LIC. EN ODONTOLOGIA',
                    'pagina_carrera' => 'https://odontologia.umss.edu.bo',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);
        }

        // Carreras de Medicina
        if ($c16) {
            $carreras = array_merge($carreras, [
                [
                    'facultad_id' => $c16->id,
                    'codigo_carrera' => '129091',
                    'nombre_carrera' => 'LIC. EN FISIOTERAPIA Y KINESIOLOGIA',
                    'pagina_carrera' => 'https://fisioterapia.umss.edu.bo',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'facultad_id' => $c16->id,
                    'codigo_carrera' => '188301',
                    'nombre_carrera' => 'LICENCIATURA EN MEDICINA',
                    'pagina_carrera' => 'https://medicina.umss.edu.bo',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'facultad_id' => $c16->id,
                    'codigo_carrera' => '133011',
                    'nombre_carrera' => 'LICENCIATURA EN NUTRICION Y DIETETICA',
                    'pagina_carrera' => 'https://nutricion.umss.edu.bo',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);
        }

        // Carreras de Medicina
        if ($c17) {
            $carreras = array_merge($carreras, [
                [
                    'facultad_id' => $c17->id,
                    'codigo_carrera' => '127091',
                    'nombre_carrera' => 'LIC. EN PLANIF. DEL TERR. Y MED. AMB',
                    'pagina_carrera' => 'https://territorio.umss.edu.bo',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'facultad_id' => $c17->id,
                    'codigo_carrera' => '202002',
                    'nombre_carrera' => 'LICENCIATURA EN ARQUITECTURA',
                    'pagina_carrera' => 'https://arquitectura.umss.edu.bo',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'facultad_id' => $c17->id,
                    'codigo_carrera' => '231802',
                    'nombre_carrera' => 'LICENCIATURA EN TURISMO',
                    'pagina_carrera' => 'https://turismo.umss.edu.bo',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'facultad_id' => $c17->id,
                    'codigo_carrera' => '229801',
                    'nombre_carrera' => 'TECNICO UNIV. SUPERIOR EN CONSTRUCCIONES',
                    'pagina_carrera' => 'https://cccc.umss.edu.bo',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);
        }

        //Carreras de Ciecnicas de Educacion
        if ($c18) {
            $carreras = array_merge($carreras, [
                [
                    'facultad_id' => $c18->id,
                    'codigo_carrera' => '269301',
                    'nombre_carrera' => 'LIC. EN LINGUIS. APLIC.ENSEÑANZA LENGUAS',
                    'pagina_carrera' => 'https://linguistica.umss.edu.bo',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'facultad_id' => $c18->id,
                    'codigo_carrera' => '258301',
                    'nombre_carrera' => 'LICENCIATURA EN CIENCIAS DE LA EDUCACION',
                    'pagina_carrera' => 'https://educacion.umss.edu.bo',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'facultad_id' => $c18->id,
                    'codigo_carrera' => '140502',
                    'nombre_carrera' => 'LICENCIATURA EN COMUNICACION SOCIAL',
                    'pagina_carrera' => 'https://comsocial.umss.edu.bo',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'facultad_id' => $c18->id,
                    'codigo_carrera' => '240101',
                    'nombre_carrera' => 'LICENCIATURA EN PSICOLOGIA',
                    'pagina_carrera' => 'https://psicologia.umss.edu.bo',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'facultad_id' => $c18->id,
                    'codigo_carrera' => '108061',
                    'nombre_carrera' => 'LICENCIATURA EN TRABAJO SOCIAL',
                    'pagina_carrera' => 'https://trabajosocial.umss.edu.bo',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);
        }

        // Carreras ciencias juridicas y politicas
        if ($c19) {
            $carreras = array_merge($carreras, [
                [
                    'facultad_id' => $c19->id,
                    'codigo_carrera' => '279901',
                    'nombre_carrera' => 'LICENCIATURA EN CIENCIAS JURIDICAS',
                    'pagina_carrera' => 'https://juridicas.umss.edu.bo',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'facultad_id' => $c19->id,
                    'codigo_carrera' => '280101',
                    'nombre_carrera' => 'LICENCIATURA EN CIENCIAS POLITICAS',
                    'pagina_carrera' => 'https://politico.umss.edu.bo',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);
        }

        //Carreras de Ciencias y tecnologia
        if ($c20) {
            $carreras = array_merge($carreras, [
                [
                    'facultad_id' => $c20->id,
                    'codigo_carrera' => '114071',
                    'nombre_carrera' => 'LICENCIATURA DIDACTICA MATEMATICA',
                    'pagina_carrera' => 'https://matematica.umss.edu.bo',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'facultad_id' => $c20->id,
                    'codigo_carrera' => '399501',
                    'nombre_carrera' => 'LICENCIATURA EN BIOLOGIA',
                    'pagina_carrera' => 'https://biologia.umss.edu.bo',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'facultad_id' => $c20->id,
                    'codigo_carrera' => '760101',
                    'nombre_carrera' => 'LICENCIATURA EN DIDACTICA DE LA FISICA',
                    'pagina_carrera' => 'https://fisica.umss.edu.bo',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'facultad_id' => $c20->id,
                    'codigo_carrera' => '359201',
                    'nombre_carrera' => 'LICENCIATURA EN FISICA',
                    'pagina_carrera' => 'https://fisica.umss.edu.bo',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'facultad_id' => $c20->id,
                    'codigo_carrera' => '650001',
                    'nombre_carrera' => 'LICENCIATURA EN ING. ELECTROMECANICA',
                    'pagina_carrera' => 'https://electromecanica.umss.edu.bo',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'facultad_id' => $c20->id,
                    'codigo_carrera' => '320902',
                    'nombre_carrera' => 'LICENCIATURA EN INGENIERIA CIVIL',
                    'pagina_carrera' => 'https://civil.umss.edu.bo',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'facultad_id' => $c20->id,
                    'codigo_carrera' => '409701',
                    'nombre_carrera' => 'LICENCIATURA EN INGENIERIA DE ALIMENTOS',
                    'pagina_carrera' => 'https://alimentos.umss.edu.bo',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'facultad_id' => $c20->id,
                    'codigo_carrera' => '411702',
                    'nombre_carrera' => 'LICENCIATURA EN INGENIERIA DE SISTEMAS',
                    'pagina_carrera' => 'https://cs.umss.edu.bo',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'facultad_id' => $c20->id,
                    'codigo_carrera' => '299701',
                    'nombre_carrera' => 'LICENCIATURA EN INGENIERIA ELECTRICA',
                    'pagina_carrera' => 'https://electrica.umss.edu.bo',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'facultad_id' => $c20->id,
                    'codigo_carrera' => '429701',
                    'nombre_carrera' => 'LICENCIATURA EN INGENIERIA ELECTRONICA',
                    'pagina_carrera' => 'https://electronica.umss.edu.bo',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'facultad_id' => $c20->id,
                    'codigo_carrera' => '309801',
                    'nombre_carrera' => 'LICENCIATURA EN INGENIERIA INDUSTRIAL',
                    'pagina_carrera' => 'https://electronica.umss.edu.bo',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'facultad_id' => $c20->id,
                    'codigo_carrera' => '134111',
                    'nombre_carrera' => 'LICENCIATURA EN INGENIERIA INFORMATICA',
                    'pagina_carrera' => 'https://cs.umss.edu.bo',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'facultad_id' => $c20->id,
                    'codigo_carrera' => '439801',
                    'nombre_carrera' => 'LICENCIATURA EN INGENIERIA MATEMATICA',
                    'pagina_carrera' => 'https://matematica.umss.edu.bo',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'facultad_id' => $c20->id,
                    'codigo_carrera' => '319801',
                    'nombre_carrera' => 'LICENCIATURA EN INGENIERIA MECANICA',
                    'pagina_carrera' => 'https://mecanica.umss.edu.bo',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'facultad_id' => $c20->id,
                    'codigo_carrera' => '339701',
                    'nombre_carrera' => 'LICENCIATURA EN INGENIERIA QUIMICA',
                    'pagina_carrera' => 'https://quimica.umss.edu.bo',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'facultad_id' => $c20->id,
                    'codigo_carrera' => '349701',
                    'nombre_carrera' => 'LICENCIATURA EN MATEMATICAS',
                    'pagina_carrera' => 'https://matematicas.umss.edu.bo',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'facultad_id' => $c20->id,
                    'codigo_carrera' => '389701',
                    'nombre_carrera' => 'LICENCIATURA EN QUIMICA',
                    'pagina_carrera' => 'https://quimica.umss.edu.bo',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'facultad_id' => $c20->id,
                    'codigo_carrera' => '165221',
                    'nombre_carrera' => 'PROGRAMA DE INGENIERIA EN BIOTECNOLOGIA',
                    'pagina_carrera' => 'https://biotecnologia.umss.edu.bo',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'facultad_id' => $c20->id,
                    'codigo_carrera' => '166231',
                    'nombre_carrera' => 'PROGRAMA LIC. EN INGENIERIA EN ENERGIA',
                    'pagina_carrera' => 'https://energia.umss.edu.bo',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);
        }

        // Carreras Politecnica del valle alto
        if ($c21) {
            $carreras = array_merge($carreras, [
                [
                    'facultad_id' => $c21->id,
                    'codigo_carrera' => '590602',
                    'nombre_carrera' => 'AUXILIAR TECNICO EN ENFERMERIA',
                    'pagina_carrera' => 'https://emfermeria.umss.edu.bo',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'facultad_id' => $c21->id,
                    'codigo_carrera' => '569201',
                    'nombre_carrera' => 'TEC.UNIV. SUP. EN INDUSTRIA DE ALIMENTOS',
                    'pagina_carrera' => 'https://alimentos.umss.edu.bo',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'facultad_id' => $c21->id,
                    'codigo_carrera' => '720101',
                    'nombre_carrera' => 'TEC.UNIV.SUP. EN MECANICA AUTOMOTRIZ',
                    'pagina_carrera' => 'https://automotriz.umss.edu.bo',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'facultad_id' => $c21->id,
                    'codigo_carrera' => '589401',
                    'nombre_carrera' => 'TEC.UNIV.SUP. EN CONSTRUCCION CIVIL',
                    'pagina_carrera' => 'https://conscivil.umss.edu.bo',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'facultad_id' => $c21->id,
                    'codigo_carrera' => '489201',
                    'nombre_carrera' => 'TEC.UNIV.SUP. EN MECANICA INDUSTRIAL',
                    'pagina_carrera' => 'https://mecanicaindustrial.umss.edu.bo',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'facultad_id' => $c21->id,
                    'codigo_carrera' => '529801',
                    'nombre_carrera' => 'TEC.UNIV.SUP. EN QUIMICA INDUSTRIAL',
                    'pagina_carrera' => 'https://quimicaindustrial.umss.edu.bo',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);
        }

        // Carreras Ciencias Sociales
        if ($c23) {
            $carreras = array_merge($carreras, [
                [
                    'facultad_id' => $c23->id,
                    'codigo_carrera' => '150802',
                    'nombre_carrera' => 'LICENCIATURA EN SOCIOLOGIA',
                    'pagina_carrera' => 'https://sociologia.umss.edu.bo',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);
        }

        // Carreras  FAC. UNID. ACAD.DESC.SAN SIMON ANDI [26]
        if ($c26) {
            $carreras = array_merge($carreras, [
                [
                    'facultad_id' => $c26->id,
                    'codigo_carrera' => '143131',
                    'nombre_carrera' => 'PROG. LIC. EN GEST. DES. ENDOG Y AGROEC',
                    'pagina_carrera' => 'https://sociologia.umss.edu.bo',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);
        }

        // Carreras  Veterinaria
        if ($c27) {
            $carreras = array_merge($carreras, [
                [
                    'facultad_id' => $c27->id,
                    'codigo_carrera' => '039503',
                    'nombre_carrera' => 'LIC. EN MEDICINA VETERINARIA Y ZOOTECNIA',
                    'pagina_carrera' => 'https://veterinaria.umss.edu.bo',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);
        }

        // Carreras  Veterinaria
        if ($c29) {
            $carreras = array_merge($carreras, [
                [
                    'facultad_id' => $c29->id,
                    'codigo_carrera' => '190602',
                    'nombre_carrera' => 'LICENCIATURA EN ENFERMERIA',
                    'pagina_carrera' => 'https://enfermeria.umss.edu.bo',
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
