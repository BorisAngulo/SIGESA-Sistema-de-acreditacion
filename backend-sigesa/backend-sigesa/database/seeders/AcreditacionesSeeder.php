<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CarreraModalidad;
use App\Models\Carrera;
use App\Models\Modalidad;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AcreditacionesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Limpiar la tabla antes de insertar
        DB::table('carrera_modalidades')->truncate();

        // Obtener modalidades
        $ceub = Modalidad::where('codigo_modalidad', 'CEUB')->first();
        $arcusur = Modalidad::where('codigo_modalidad', 'ARCUSUR')->first();

        if (!$ceub || !$arcusur) {
            $this->command->error('❌ No se encontraron las modalidades CEUB y ARCUSUR. Ejecuta ModalidadSeeder primero.');
            return;
        }

        // Obtener todas las carreras
            $carreras = Carrera::all();


        // ========================
        // ACREDITACIONES CEUB
        // ========================

        // 1. CONTADURIA PUBLICA
        $contaduriaPublica = Carrera::where('codigo_carrera', '089801')->first();
        if ($contaduriaPublica) {
            CarreraModalidad::create([
                'carrera_id' => $contaduriaPublica->id,
                'modalidad_id' => $ceub->id,
                'estado_modalidad' => true, // Finalizada
                'fecha_ini_proceso' => null,
                'fecha_fin_proceso' => null,
                'fecha_ini_aprobacion' => '2012-12-13 17:00:00',
                'fecha_fin_aprobacion' => '2018-12-13 17:00:00',
                'puntaje_acreditacion' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
        // 2. INFORMATICA
        $informatica = Carrera::where('codigo_carrera', '134111')->first();
        if ($informatica) {
            CarreraModalidad::create([
                'carrera_id' => $informatica->id,
                'modalidad_id' => $ceub->id,
                'estado_modalidad' => true, // Finalizada
                'fecha_ini_proceso' => null,
                'fecha_fin_proceso' => null,
                'fecha_ini_aprobacion' => '2012-04-27 17:00:00',
                'fecha_fin_aprobacion' => '2018-04-27 17:00:00',
                'puntaje_acreditacion' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
        // 3. SISTEMAS
        $sistemas = Carrera::where('codigo_carrera', '411702')->first();
        if ($sistemas) {
            CarreraModalidad::create([
                'carrera_id' => $sistemas->id,
                'modalidad_id' => $ceub->id,
                'estado_modalidad' => true, // Finalizada
                'fecha_ini_proceso' => null,
                'fecha_fin_proceso' => null,
                'fecha_ini_aprobacion' => '2012-04-27 17:00:00',
                'fecha_fin_aprobacion' => '2018-04-27 17:00:00',
                'puntaje_acreditacion' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
        // 4. ALIMENTOS
        $alimentos = Carrera::where('codigo_carrera', '409701')->first();
        if ($alimentos) {
            CarreraModalidad::create([
                'carrera_id' => $alimentos->id,
                'modalidad_id' => $ceub->id,
                'estado_modalidad' => true, // Finalizada
                'fecha_ini_proceso' => null,
                'fecha_fin_proceso' => null,
                'fecha_ini_aprobacion' => '2012-04-27 17:00:00',
                'fecha_fin_aprobacion' => '2018-04-27 17:00:00',
                'puntaje_acreditacion' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
        // 5. ELECTROMECANICA
        $electromecanica = Carrera::where('codigo_carrera', '650001')->first();
        if ($electromecanica) {
            CarreraModalidad::create([
                'carrera_id' => $electromecanica->id,
                'modalidad_id' => $ceub->id,
                'estado_modalidad' => true, // Finalizada
                'fecha_ini_proceso' => null,
                'fecha_fin_proceso' => null,
                'fecha_ini_aprobacion' => '2012-04-13 17:00:00',
                'fecha_fin_aprobacion' => '2018-04-13 17:00:00',
                'puntaje_acreditacion' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
        // 6. MATEMATICAS
        $matematicas = Carrera::where('codigo_carrera', '349701')->first();
        if ($matematicas) {
            CarreraModalidad::create([
                'carrera_id' => $matematicas->id,
                'modalidad_id' => $ceub->id,
                'estado_modalidad' => true, // Finalizada
                'fecha_ini_proceso' => null,
                'fecha_fin_proceso' => null,
                'fecha_ini_aprobacion' => '2012-04-13 17:00:00',
                'fecha_fin_aprobacion' => '2018-04-13 17:00:00',
                'puntaje_acreditacion' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
        // 7. FISICA
        $fisica = Carrera::where('codigo_carrera', '359201')->first();
        if ($fisica) {
            CarreraModalidad::create([
                'carrera_id' => $fisica->id,
                'modalidad_id' => $ceub->id,
                'estado_modalidad' => true, // Finalizada
                'fecha_ini_proceso' => null,
                'fecha_fin_proceso' => null,
                'fecha_ini_aprobacion' => '2013-05-24 17:00:00',
                'fecha_fin_aprobacion' => '2019-05-24 17:00:00',
                'puntaje_acreditacion' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
        // 8. BIOLOGIA
        $biologia = Carrera::where('codigo_carrera', '399501')->first();
        if ($biologia) {
            CarreraModalidad::create([
                'carrera_id' => $biologia->id,
                'modalidad_id' => $ceub->id,
                'estado_modalidad' => true, // Finalizada
                'fecha_ini_proceso' => null,
                'fecha_fin_proceso' => null,
                'fecha_ini_aprobacion' => '2013-05-24 17:00:00',
                'fecha_fin_aprobacion' => '2019-05-24 17:00:00',
                'puntaje_acreditacion' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
        // 9. ING MATEMATICA
        $ingMatematica = Carrera::where('codigo_carrera', '439801')->first();
        if ($ingMatematica) {
            CarreraModalidad::create([
                'carrera_id' => $ingMatematica->id,
                'modalidad_id' => $ceub->id,
                'estado_modalidad' => true, // Finalizada
                'fecha_ini_proceso' => null,
                'fecha_fin_proceso' => null,
                'fecha_ini_aprobacion' => '2013-05-17 17:00:00',
                'fecha_fin_aprobacion' => '2019-05-17 17:00:00',
                'puntaje_acreditacion' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
        // 9. QUIMICA
        $quimica = Carrera::where('codigo_carrera', '389701')->first();
        if ($quimica) {
            CarreraModalidad::create([
                'carrera_id' => $quimica->id,
                'modalidad_id' => $ceub->id,
                'estado_modalidad' => true, // Finalizada
                'fecha_ini_proceso' => null,
                'fecha_fin_proceso' => null,
                'fecha_ini_aprobacion' => '2013-05-17 17:00:00',
                'fecha_fin_aprobacion' => '2019-05-17 17:00:00',
                'puntaje_acreditacion' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
        // 10. TURISMO
        $turismo = Carrera::where('codigo_carrera', '231802')->first();
        if ($turismo) {
            CarreraModalidad::create([
                'carrera_id' => $turismo->id,
                'modalidad_id' => $ceub->id,
                'estado_modalidad' => true, // Finalizada
                'fecha_ini_proceso' => null,
                'fecha_fin_proceso' => null,
                'fecha_ini_aprobacion' => '2013-05-17 17:00:00',
                'fecha_fin_aprobacion' => '2019-05-17 17:00:00',
                'puntaje_acreditacion' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
        // 11. MECANICA
        $mecanica = Carrera::where('codigo_carrera', '319801')->first();
        if ($mecanica) {
            CarreraModalidad::create([
                'carrera_id' => $mecanica->id,
                'modalidad_id' => $ceub->id,
                'estado_modalidad' => true, // Finalizada
                'fecha_ini_proceso' => null,
                'fecha_fin_proceso' => null,
                'fecha_ini_aprobacion' => '2019-09-05 17:00:00',
                'fecha_fin_aprobacion' => '2025-09-05 17:00:00',
                'puntaje_acreditacion' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
        // 12. ELECTRICA
        $electrica = Carrera::where('codigo_carrera', '299701')->first();
        if ($electrica) {
            CarreraModalidad::create([
                'carrera_id' => $electrica->id,
                'modalidad_id' => $ceub->id,
                'estado_modalidad' => true, // Finalizada
                'fecha_ini_proceso' => null,
                'fecha_fin_proceso' => null,
                'fecha_ini_aprobacion' => '2019-09-05 17:00:00',
                'fecha_fin_aprobacion' => '2025-09-05 17:00:00',
                'puntaje_acreditacion' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
        // 13. INDUSTRIAL
        $industrial = Carrera::where('codigo_carrera', '309801')->first();
        if ($industrial) {
            CarreraModalidad::create([
                'carrera_id' => $industrial->id,
                'modalidad_id' => $ceub->id,
                'estado_modalidad' => true, // Finalizada
                'fecha_ini_proceso' => null,
                'fecha_fin_proceso' => null,
                'fecha_ini_aprobacion' => '2019-09-05 17:00:00',
                'fecha_fin_aprobacion' => '2025-09-05 17:00:00',
                'puntaje_acreditacion' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
        // 14. ING QUIMICA
        $ingQuimica = Carrera::where('codigo_carrera', '339701')->first();
        if ($ingQuimica) {
            CarreraModalidad::create([
                'carrera_id' => $ingQuimica->id,
                'modalidad_id' => $ceub->id,
                'estado_modalidad' => true, // Finalizada
                'fecha_ini_proceso' => null,
                'fecha_fin_proceso' => null,
                'fecha_ini_aprobacion' => '2019-09-05 17:00:00',
                'fecha_fin_aprobacion' => '2025-09-05 17:00:00',
                'puntaje_acreditacion' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
        // 15. MEDICINA
        $medicina = Carrera::where('codigo_carrera', '188301')->first();
        if ($medicina) {
            CarreraModalidad::create([
                'carrera_id' => $medicina->id,
                'modalidad_id' => $ceub->id,
                'estado_modalidad' => true, // Finalizada
                'fecha_ini_proceso' => null,
                'fecha_fin_proceso' => null,
                'fecha_ini_aprobacion' => '2019-05-12 17:00:00',
                'fecha_fin_aprobacion' => '2025-05-12 17:00:00',
                'puntaje_acreditacion' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
        // 16. COMERCIAL
        $comercial = Carrera::where('codigo_carrera', '125091')->first();
        if ($comercial) {
            CarreraModalidad::create([
                'carrera_id' => $comercial->id,
                'modalidad_id' => $ceub->id,
                'estado_modalidad' => true, // Finalizada
                'fecha_ini_proceso' => null,
                'fecha_fin_proceso' => null,
                'fecha_ini_aprobacion' => '2023-10-11 17:00:00',
                'fecha_fin_aprobacion' => '2029-10-11 17:00:00',
                'puntaje_acreditacion' => 72.90,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
        // 17. CIENCIAS DE LA EDUCACION
        $cienciasEducacion = Carrera::where('codigo_carrera', '258301')->first();
        if ($cienciasEducacion) {
            CarreraModalidad::create([
                'carrera_id' => $cienciasEducacion->id,
                'modalidad_id' => $ceub->id,
                'estado_modalidad' => true, // Finalizada
                'fecha_ini_proceso' => null,
                'fecha_fin_proceso' => null,
                'fecha_ini_aprobacion' => '2023-10-11 17:00:00',
                'fecha_fin_aprobacion' => '2029-10-11 17:00:00',
                'puntaje_acreditacion' => 87.50,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
        // 18. BIOQUIMICA Y FARMACIA
        $bioquimicaFarmacia = Carrera::where('codigo_carrera', '049001')->first();
        if ($bioquimicaFarmacia) {
            CarreraModalidad::create([
                'carrera_id' => $bioquimicaFarmacia->id,
                'modalidad_id' => $ceub->id,
                'estado_modalidad' => true, // Finalizada
                'fecha_ini_proceso' => null,
                'fecha_fin_proceso' => null,
                'fecha_ini_aprobacion' => '2023-10-11 17:00:00',
                'fecha_fin_aprobacion' => '2029-10-11 17:00:00',
                'puntaje_acreditacion' => 82.38,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
        // 19. ODONTOLOGIA
        $odontologia = Carrera::where('codigo_carrera', '179901')->first();
        if ($odontologia) {
            CarreraModalidad::create([
                'carrera_id' => $odontologia->id,
                'modalidad_id' => $ceub->id,
                'estado_modalidad' => true, // Finalizada
                'fecha_ini_proceso' => null,
                'fecha_fin_proceso' => null,
                'fecha_ini_aprobacion' => '2023-09-18 17:00:00',
                'fecha_fin_aprobacion' => '2029-09-18 17:00:00',
                'puntaje_acreditacion' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
        // 20. CIVIL
        $civil = Carrera::where('codigo_carrera', '320902')->first();
        if ($civil) {
            CarreraModalidad::create([
                'carrera_id' => $civil->id,
                'modalidad_id' => $ceub->id,
                'estado_modalidad' => true, // Finalizada
                'fecha_ini_proceso' => null,
                'fecha_fin_proceso' => null,
                'fecha_ini_aprobacion' => '2023-09-18 17:00:00',
                'fecha_fin_aprobacion' => '2029-09-18 17:00:00',
                'puntaje_acreditacion' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
        // 21. CIENCIAS JURIDICAS
        $cienciasJuridicas = Carrera::where('codigo_carrera', '279901')->first();
        if ($cienciasJuridicas) {
            CarreraModalidad::create([
                'carrera_id' => $cienciasJuridicas->id,
                'modalidad_id' => $ceub->id,
                'estado_modalidad' => true, // Finalizada
                'fecha_ini_proceso' => null,
                'fecha_fin_proceso' => null,
                'fecha_ini_aprobacion' => '2024-11-20 17:00:00',
                'fecha_fin_aprobacion' => '2030-11-20 17:00:00',
                'puntaje_acreditacion' => 78.27,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
        // 22. CIENCIAS POLITICAS
        $cienciasPoliticas = Carrera::where('codigo_carrera', '280101')->first();
        if ($cienciasPoliticas) {
            CarreraModalidad::create([
                'carrera_id' => $cienciasPoliticas->id,
                'modalidad_id' => $ceub->id,
                'estado_modalidad' => true, // Finalizada
                'fecha_ini_proceso' => null,
                'fecha_fin_proceso' => null,
                'fecha_ini_aprobacion' => '2024-11-20 17:00:00',
                'fecha_fin_aprobacion' => '2030-11-20 17:00:00',
                'puntaje_acreditacion' => 83.49,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
        // 23. DISEÑO GRAFICO Y COMUNICACION VISUAL
        $disenoGrafico = Carrera::where('codigo_carrera', '280201')->first();
        if ($disenoGrafico) {
            CarreraModalidad::create([
                'carrera_id' => $disenoGrafico->id,
                'modalidad_id' => $ceub->id,
                'estado_modalidad' => true, // Finalizada
                'fecha_ini_proceso' => null,
                'fecha_fin_proceso' => null,
                'fecha_ini_aprobacion' => '2024-11-20 17:00:00',
                'fecha_fin_aprobacion' => '2030-11-20 17:00:00',
                'puntaje_acreditacion' => 77.01,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
        // 24. ADMINISTRACION DE EMPRESAS
        $administracionEmpresas = Carrera::where('codigo_carrera', '109401')->first();
        if ($administracionEmpresas) {
            CarreraModalidad::create([
                'carrera_id' => $administracionEmpresas->id,
                'modalidad_id' => $ceub->id,
                'estado_modalidad' => true, // Finalizada
                'fecha_ini_proceso' => null,
                'fecha_fin_proceso' => null,
                'fecha_ini_aprobacion' => '2024-11-01 17:00:00',
                'fecha_fin_aprobacion' => '2030-11-01 17:00:00',
                'puntaje_acreditacion' => 92.52,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
        // 25. ECONOMIA
        $economia = Carrera::where('codigo_carrera', '059801')->first();
        if ($economia) {
            CarreraModalidad::create([
                'carrera_id' => $economia->id,
                'modalidad_id' => $ceub->id,
                'estado_modalidad' => true, // Finalizada
                'fecha_ini_proceso' => null,
                'fecha_fin_proceso' => null,
                'fecha_ini_aprobacion' => '2024-10-31 17:00:00',
                'fecha_fin_aprobacion' => '2030-10-31 17:00:00',
                'puntaje_acreditacion' => 91.84,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
        // 25. TRABAJO SOCIAL
        $trabajoSocial = Carrera::where('codigo_carrera', '108061')->first();
        if ($trabajoSocial) {
            CarreraModalidad::create([
                'carrera_id' => $trabajoSocial->id,
                'modalidad_id' => $ceub->id,
                'estado_modalidad' => true, // Finalizada
                'fecha_ini_proceso' => null,
                'fecha_fin_proceso' => null,
                'fecha_ini_aprobacion' => '2024-10-31 17:00:00',
                'fecha_fin_aprobacion' => '2030-10-31 17:00:00',
                'puntaje_acreditacion' => 70.25,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
        // 26. FINANCIERA
        $financiera = Carrera::where('codigo_carrera', '126091')->first();
        if ($financiera) {
            CarreraModalidad::create([
                'carrera_id' => $financiera->id,
                'modalidad_id' => $ceub->id,
                'estado_modalidad' => true, // Finalizada
                'fecha_ini_proceso' => null,
                'fecha_fin_proceso' => null,
                'fecha_ini_aprobacion' => '2024-05-10 17:00:00',
                'fecha_fin_aprobacion' => '2030-05-10 17:00:00',
                'puntaje_acreditacion' => 85.52,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
        // 26. COMUNICACION SOCIAL
        $comunicacionSocial = Carrera::where('codigo_carrera', '140502')->first();
        if ($comunicacionSocial) {
            CarreraModalidad::create([
                'carrera_id' => $comunicacionSocial->id,
                'modalidad_id' => $ceub->id,
                'estado_modalidad' => true, // Finalizada
                'fecha_ini_proceso' => null,
                'fecha_fin_proceso' => null,
                'fecha_ini_aprobacion' => '2024-04-19 17:00:00',
                'fecha_fin_aprobacion' => '2030-04-19 17:00:00',
                'puntaje_acreditacion' => 84.73,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // ========================
        // ACREDITACIONES arcusur
        // ========================

        // 1. MECANICA
        if ($mecanica) {
            CarreraModalidad::create([
                'carrera_id' => $mecanica->id,
                'modalidad_id' => $arcusur->id,
                'estado_modalidad' => true, 
                'fecha_ini_proceso' => '2019-09-05 08:00:00',
                'fecha_fin_proceso' => '2025-09-03 17:00:00',
                'fecha_ini_aprobacion' => null,
                'fecha_fin_aprobacion' => null,
                'puntaje_acreditacion' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
        // 2. ELECTRICA
        if ($electrica) {
            CarreraModalidad::create([
                'carrera_id' => $electrica->id,
                'modalidad_id' => $arcusur->id,
                'estado_modalidad' => true, 
                'fecha_ini_proceso' => '2019-09-05 08:00:00',
                'fecha_fin_proceso' => '2025-09-03 17:00:00',
                'fecha_ini_aprobacion' => null,
                'fecha_fin_aprobacion' => null,
                'puntaje_acreditacion' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
        // 3. INDUSTRIAL
        if ($industrial) {
            CarreraModalidad::create([
                'carrera_id' => $industrial->id,
                'modalidad_id' => $arcusur->id,
                'estado_modalidad' => true, 
                'fecha_ini_proceso' => '2019-09-05 08:00:00',
                'fecha_fin_proceso' => '2025-09-03 17:00:00',
                'fecha_ini_aprobacion' => null,
                'fecha_fin_aprobacion' => null,
                'puntaje_acreditacion' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
        // 4. ING QUIMICA
        if ($ingQuimica) {
            CarreraModalidad::create([
                'carrera_id' => $ingQuimica->id,
                'modalidad_id' => $arcusur->id,
                'estado_modalidad' => true, 
                'fecha_ini_proceso' => '2019-09-05 08:00:00',
                'fecha_fin_proceso' => '2025-09-03 17:00:00',
                'fecha_ini_aprobacion' => null,
                'fecha_fin_aprobacion' => null,
                'puntaje_acreditacion' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
        // 5. MEDICINA
        if ($medicina) {
            CarreraModalidad::create([
                'carrera_id' => $medicina->id,
                'modalidad_id' => $arcusur->id,
                'estado_modalidad' => true, 
                'fecha_ini_proceso' => '2019-05-12 08:00:00',
                'fecha_fin_proceso' => '2025-05-12 17:00:00',
                'fecha_ini_aprobacion' => null,
                'fecha_fin_aprobacion' => null,
                'puntaje_acreditacion' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
        // 6. AGRONOMICA
        $agronomica = Carrera::where('codigo_carrera', '718801')->first();
        if ($agronomica) {
            CarreraModalidad::create([
                'carrera_id' => $agronomica->id,
                'modalidad_id' => $arcusur->id,
                'estado_modalidad' => true, 
                'fecha_ini_proceso' => '2023-12-11 08:00:00',
                'fecha_fin_proceso' => '2029-12-11 17:00:00',
                'fecha_ini_aprobacion' => null,
                'fecha_fin_aprobacion' => null,
                'puntaje_acreditacion' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
        // 7. ARQUITECTURA
        $arquitectura = Carrera::where('codigo_carrera', '202002')->first();
        if ($arquitectura) {
            CarreraModalidad::create([
                'carrera_id' => $arquitectura->id,
                'modalidad_id' => $arcusur->id,
                'estado_modalidad' => true, 
                'fecha_ini_proceso' => '2023-12-11 08:00:00',
                'fecha_fin_proceso' => '2029-12-11 17:00:00',
                'fecha_ini_aprobacion' => null,
                'fecha_fin_aprobacion' => null,
                'puntaje_acreditacion' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
        // 8. ODONTOLOGIA
        if ($odontologia) {
            CarreraModalidad::create([
                'carrera_id' => $odontologia->id,
                'modalidad_id' => $arcusur->id,
                'estado_modalidad' => true, 
                'fecha_ini_proceso' => '2023-09-18 08:00:00',
                'fecha_fin_proceso' => '2029-09-18 17:00:00',
                'fecha_ini_aprobacion' => null,
                'fecha_fin_aprobacion' => null,
                'puntaje_acreditacion' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
        // 9. CIVIL
        if ($civil) {
            CarreraModalidad::create([
                'carrera_id' => $civil->id,
                'modalidad_id' => $arcusur->id,
                'estado_modalidad' => true, 
                'fecha_ini_proceso' => '2023-09-18 08:00:00',
                'fecha_fin_proceso' => '2029-09-18 17:00:00',
                'fecha_ini_aprobacion' => null,
                'fecha_fin_aprobacion' => null,
                'puntaje_acreditacion' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
        // 10. ENFERMERIA
        $enfermeria = Carrera::where('codigo_carrera', '190602')->first();
        if ($enfermeria) {
            CarreraModalidad::create([
                'carrera_id' => $enfermeria->id,
                'modalidad_id' => $arcusur->id,
                'estado_modalidad' => true, 
                'fecha_ini_proceso' => '2024-10-01 08:00:00',
                'fecha_fin_proceso' => '2030-10-01 17:00:00',
                'fecha_ini_aprobacion' => null,
                'fecha_fin_aprobacion' => null,
                'puntaje_acreditacion' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
        // 11. VETERINARIA
        $veterinaria = Carrera::where('codigo_carrera', '039503')->first();
        if ($veterinaria) {
            CarreraModalidad::create([
                'carrera_id' => $veterinaria->id,
                'modalidad_id' => $arcusur->id,
                'estado_modalidad' => true, 
                'fecha_ini_proceso' => '2024-10-01 08:00:00',
                'fecha_fin_proceso' => '2030-10-01 17:00:00',
                'fecha_ini_aprobacion' => null,
                'fecha_fin_aprobacion' => null,
                'puntaje_acreditacion' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $this->command->info('✅ Acreditaciones creadas:');
    }

}
