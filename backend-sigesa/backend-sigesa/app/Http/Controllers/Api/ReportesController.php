<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Facultad;
use App\Models\Carrera;
use App\Models\Modalidad;
use App\Models\CarreraModalidad;
use App\Models\SubFase;
use App\Models\Fase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportesController extends Controller
{
    /**
     * Encontrar la acreditación vigente en una fecha específica
     */
    private function encontrarAcreditacionVigente($acreditaciones, $fechaReferencia)
    {
        if ($acreditaciones->isEmpty()) {
            return null;
        }

        $acreditacionVigente = null;
        $acreditacionMasRecienteVigente = null;

        // Debug: Log de entrada
        \Log::info("=== ENCONTRAR ACREDITACION VIGENTE ===");
        \Log::info("Fecha referencia: " . $fechaReferencia->format('Y-m-d H:i:s'));
        \Log::info("Total acreditaciones: " . $acreditaciones->count());

        foreach ($acreditaciones as $acreditacion) {
            $esVigente = false;

            \Log::info("Evaluando acreditación ID: " . $acreditacion->id);
            \Log::info("Carrera: " . $acreditacion->carrera_id);
            \Log::info("Modalidad: " . ($acreditacion->modalidad->nombre_modalidad ?? 'N/A'));
            \Log::info("Fecha ini aprobación: " . ($acreditacion->fecha_ini_aprobacion ?? 'null'));
            \Log::info("Fecha fin aprobación: " . ($acreditacion->fecha_fin_aprobacion ?? 'null'));

            // Si tiene fechas de aprobación, verificar si estaba vigente en la fecha de referencia
            if ($acreditacion->fecha_ini_aprobacion && $acreditacion->fecha_fin_aprobacion) {
                $fechaInicioAprobacion = Carbon::parse($acreditacion->fecha_ini_aprobacion);
                $fechaFinAprobacion = Carbon::parse($acreditacion->fecha_fin_aprobacion);
                
                \Log::info("Evaluando rango: " . $fechaInicioAprobacion->format('Y-m-d') . " <= " . $fechaReferencia->format('Y-m-d') . " <= " . $fechaFinAprobacion->format('Y-m-d'));
                
                if ($fechaReferencia->between($fechaInicioAprobacion, $fechaFinAprobacion)) {
                    $esVigente = true;
                    \Log::info("✅ VIGENTE: Está dentro del rango de aprobación");
                } else {
                    \Log::info("❌ NO VIGENTE: Fuera del rango de aprobación");
                }
            }
            // Si no tiene aprobación pero tiene proceso, verificar si el proceso estaba activo
            elseif ($acreditacion->fecha_ini_proceso) {
                $fechaInicioProceso = Carbon::parse($acreditacion->fecha_ini_proceso);
                
                // Verificar si el proceso había iniciado en la fecha de referencia
                if ($fechaReferencia->greaterThanOrEqualTo($fechaInicioProceso)) {
                    // Si tiene fecha fin de proceso, verificar que no haya terminado
                    if ($acreditacion->fecha_fin_proceso) {
                        $fechaFinProceso = Carbon::parse($acreditacion->fecha_fin_proceso);
                        if ($fechaReferencia->lessThanOrEqualTo($fechaFinProceso)) {
                            $esVigente = true;
                        }
                    } else {
                        // Si no tiene fecha fin, se considera activo si ya había iniciado
                        $esVigente = true;
                    }
                }
            }

            // Si es vigente, verificar si es la más reciente
            if ($esVigente) {
                if (!$acreditacionMasRecienteVigente) {
                    $acreditacionMasRecienteVigente = $acreditacion;
                } else {
                    // Usar fecha_ini_aprobacion como criterio principal, luego fecha_ini_proceso
                    $fechaComparacionActual = $acreditacion->fecha_ini_aprobacion 
                        ? Carbon::parse($acreditacion->fecha_ini_aprobacion)
                        : ($acreditacion->fecha_ini_proceso ? Carbon::parse($acreditacion->fecha_ini_proceso) : null);
                    
                    $fechaComparacionExistente = $acreditacionMasRecienteVigente->fecha_ini_aprobacion 
                        ? Carbon::parse($acreditacionMasRecienteVigente->fecha_ini_aprobacion)
                        : ($acreditacionMasRecienteVigente->fecha_ini_proceso ? Carbon::parse($acreditacionMasRecienteVigente->fecha_ini_proceso) : null);
                    
                    // Si ambas tienen fechas válidas, tomar la más reciente
                    if ($fechaComparacionActual && $fechaComparacionExistente) {
                        if ($fechaComparacionActual->greaterThan($fechaComparacionExistente)) {
                            $acreditacionMasRecienteVigente = $acreditacion;
                        }
                    } elseif ($fechaComparacionActual && !$fechaComparacionExistente) {
                        // Si solo la actual tiene fecha, tomarla
                        $acreditacionMasRecienteVigente = $acreditacion;
                    }
                    // Si solo la existente tiene fecha, mantenerla (no hacer nada)
                }
            }
        }

        \Log::info("Resultado final: " . ($acreditacionMasRecienteVigente ? 'ID ' . $acreditacionMasRecienteVigente->id : 'null'));
        \Log::info("=== FIN ENCONTRAR ACREDITACION ===");

        return $acreditacionMasRecienteVigente;
    }

    /**
     * Clasificar una acreditación según su estado actual
     */
    private function clasificarAcreditacion($acreditacion, $estadisticas, $fechaReferencia)
    {
        // Si tiene fechas de aprobación, verificar si estaba vigente en la fecha de referencia
        if ($acreditacion->fecha_ini_aprobacion && $acreditacion->fecha_fin_aprobacion) {
            $fechaInicioAprobacion = Carbon::parse($acreditacion->fecha_ini_aprobacion);
            $fechaFinAprobacion = Carbon::parse($acreditacion->fecha_fin_aprobacion);
            
            if ($fechaReferencia->between($fechaInicioAprobacion, $fechaFinAprobacion)) {
                // Acreditación vigente en la fecha de referencia
                $estadisticas['acreditadas']++;
            } else {
                // Fuera del período de aprobación en la fecha de referencia
                $estadisticas['vencidas']++;
            }
        } 
        // Si tiene fecha de proceso pero no de aprobación
        elseif ($acreditacion->fecha_ini_proceso && $acreditacion->estado_modalidad) {
            $fechaInicio = Carbon::parse($acreditacion->fecha_ini_proceso);
            
            // Verificar si el proceso estaba activo en la fecha de referencia
            if ($fechaReferencia->greaterThanOrEqualTo($fechaInicio)) {
                if ($acreditacion->fecha_fin_proceso) {
                    $fechaFin = Carbon::parse($acreditacion->fecha_fin_proceso);
                    if ($fechaReferencia->lessThanOrEqualTo($fechaFin)) {
                        // En proceso activo en la fecha de referencia
                        $estadisticas['en_proceso']++;
                    } else {
                        // Proceso terminado en la fecha de referencia
                        $estadisticas['vencidas']++;
                    }
                } else {
                    // Proceso sin fecha fin, activo si ya había iniciado
                    $estadisticas['en_proceso']++;
                }
            } else {
                // El proceso aún no había iniciado en la fecha de referencia
                $estadisticas['vencidas']++;
            }
        }
        // Si existe el registro pero no tiene fechas válidas
        else {
            $estadisticas['vencidas']++;
        }

        return $estadisticas;
    }

    /**
     * Obtener reporte detallado de facultades con análisis de acreditación
     */
    public function getReporteFacultades(Request $request)
    {
        try {
            $fecha = $request->get('fecha');
            $facultadId = $request->get('facultad_id');
            $modalidadTipo = $request->get('modalidad_tipo', 'todos');

            // Si no se proporciona fecha, usar la fecha actual
            $fechaReferencia = $fecha ? Carbon::parse($fecha) : Carbon::now();

            // Query base para facultades
            $facultadesQuery = Facultad::with(['carreras']);
            
            if ($facultadId && $facultadId !== 'todas') {
                $facultadesQuery->where('id', $facultadId);
            }

            $facultades = $facultadesQuery->get();

            $reporteFacultades = $facultades->map(function ($facultad) use ($modalidadTipo, $fechaReferencia) {
                // Obtener todas las carreras de la facultad
                $carreras = $facultad->carreras;
                $totalCarreras = $carreras->count();
                
                // Inicializar contadores para ambas modalidades
                $estadisticasCEUB = [
                    'acreditadas' => 0,          // Con fecha de aprobación vigente
                    'en_proceso' => 0,           // Con fecha de proceso vigente
                    'no_acreditadas' => 0,       // Sin carrera-modalidad
                    'vencidas' => 0              // Fecha de aprobación expirada
                ];
                
                $estadisticasARCUSUR = [
                    'acreditadas' => 0,
                    'en_proceso' => 0,
                    'no_acreditadas' => 0,
                    'vencidas' => 0
                ];

                // Analizar cada carrera
                foreach ($carreras as $carrera) {
                    // Buscar acreditaciones CEUB para esta carrera (aplicando filtro modalidadTipo)
                    $acreditacionCEUB = null;
                    if ($modalidadTipo === 'todos' || $modalidadTipo === 'ambas' || $modalidadTipo === 'ceub') {
                        // Obtener todas las acreditaciones CEUB para encontrar la vigente en la fecha de referencia
                        $acreditacionesCEUB = CarreraModalidad::where('carrera_id', $carrera->id)
                            ->whereHas('modalidad', function($q) {
                                $q->where('nombre_modalidad', 'like', '%CEUB%');
                            })
                            ->get();
                        
                        // Filtrar y encontrar la acreditación vigente en la fecha de referencia
                        $acreditacionCEUB = $this->encontrarAcreditacionVigente($acreditacionesCEUB, $fechaReferencia);
                    }

                    // Buscar acreditaciones ARCUSUR para esta carrera (aplicando filtro modalidadTipo)
                    $acreditacionARCUSUR = null;
                    if ($modalidadTipo === 'todos' || $modalidadTipo === 'ambas' || $modalidadTipo === 'arcusur') {
                        // Obtener todas las acreditaciones ARCUSUR para encontrar la vigente en la fecha de referencia
                        $acreditacionesARCUSUR = CarreraModalidad::where('carrera_id', $carrera->id)
                            ->whereHas('modalidad', function($q) {
                                $q->where('nombre_modalidad', 'like', '%ARCUSUR%');
                            })
                            ->get();
                        
                        // Filtrar y encontrar la acreditación vigente en la fecha de referencia
                        $acreditacionARCUSUR = $this->encontrarAcreditacionVigente($acreditacionesARCUSUR, $fechaReferencia);
                    }

                    // Clasificar CEUB
                    if ($acreditacionCEUB) {
                        $estadisticasCEUB = $this->clasificarAcreditacion($acreditacionCEUB, $estadisticasCEUB, $fechaReferencia);
                    } else {
                        $estadisticasCEUB['no_acreditadas']++;
                    }

                    // Clasificar ARCUSUR
                    if ($acreditacionARCUSUR) {
                        $estadisticasARCUSUR = $this->clasificarAcreditacion($acreditacionARCUSUR, $estadisticasARCUSUR, $fechaReferencia);
                    } else {
                        $estadisticasARCUSUR['no_acreditadas']++;
                    }
                }

                // Calcular totales (una carrera acreditada si tiene CEUB O ARCUSUR, no ambas)
                $carrerasAcreditadas = 0;
                $carrerasEnProceso = 0;
                $carrerasVencidas = 0;
                
                // Contar carreras únicas por estado (no sumar modalidades)
                foreach ($carreras as $carrera) {
                    $tieneAcreditacionActiva = false;
                    $tieneProcesoActivo = false;
                    $tieneAcreditacionVencida = false;
                    
                    // Verificar CEUB (solo si modalidadTipo permite)
                    $acreditacionCEUB = null;
                    if ($modalidadTipo === 'todos' || $modalidadTipo === 'ambas' || $modalidadTipo === 'ceub') {
                        $acreditacionesCEUB = CarreraModalidad::where('carrera_id', $carrera->id)
                            ->whereHas('modalidad', function($q) {
                                $q->where('nombre_modalidad', 'like', '%CEUB%');
                            })
                            ->get();
                        
                        $acreditacionCEUB = $this->encontrarAcreditacionVigente($acreditacionesCEUB, $fechaReferencia);
                    }
                    
                    // Verificar ARCUSUR (solo si modalidadTipo permite)
                    $acreditacionARCUSUR = null;
                    if ($modalidadTipo === 'todos' || $modalidadTipo === 'ambas' || $modalidadTipo === 'arcusur') {
                        $acreditacionesARCUSUR = CarreraModalidad::where('carrera_id', $carrera->id)
                            ->whereHas('modalidad', function($q) {
                                $q->where('nombre_modalidad', 'like', '%ARCUSUR%');
                            })
                            ->get();
                        
                        $acreditacionARCUSUR = $this->encontrarAcreditacionVigente($acreditacionesARCUSUR, $fechaReferencia);
                    }
                    
                    // Evaluar estado de la carrera basado en cualquiera de las modalidades a la fecha de referencia
                    foreach ([$acreditacionCEUB, $acreditacionARCUSUR] as $acreditacion) {
                        if ($acreditacion) {
                            if ($acreditacion->fecha_ini_aprobacion && $acreditacion->fecha_fin_aprobacion) {
                                $fechaInicioAprobacion = Carbon::parse($acreditacion->fecha_ini_aprobacion);
                                $fechaFinAprobacion = Carbon::parse($acreditacion->fecha_fin_aprobacion);
                                if ($fechaReferencia->between($fechaInicioAprobacion, $fechaFinAprobacion)) {
                                    $tieneAcreditacionActiva = true;
                                } else {
                                    $tieneAcreditacionVencida = true;
                                }
                            } elseif ($acreditacion->fecha_ini_proceso && $acreditacion->estado_modalidad) {
                                $fechaInicio = Carbon::parse($acreditacion->fecha_ini_proceso);
                                // Verificar si el proceso estaba activo en la fecha de referencia
                                if ($fechaReferencia->greaterThanOrEqualTo($fechaInicio)) {
                                    if ($acreditacion->fecha_fin_proceso) {
                                        $fechaFin = Carbon::parse($acreditacion->fecha_fin_proceso);
                                        if ($fechaReferencia->lessThanOrEqualTo($fechaFin)) {
                                            $tieneProcesoActivo = true;
                                        } else {
                                            $tieneAcreditacionVencida = true;
                                        }
                                    } else {
                                        // Proceso sin fecha fin, activo si ya había iniciado
                                        $tieneProcesoActivo = true;
                                    }
                                } else {
                                    // El proceso aún no había iniciado en la fecha de referencia
                                    $tieneAcreditacionVencida = true;
                                }
                            } else {
                                $tieneAcreditacionVencida = true;
                            }
                        }
                    }
                    
                    // Asignar estado de la carrera (prioridad: activa > proceso > vencida)
                    if ($tieneAcreditacionActiva) {
                        $carrerasAcreditadas++;
                    } elseif ($tieneProcesoActivo) {
                        $carrerasEnProceso++;
                    } elseif ($tieneAcreditacionVencida) {
                        $carrerasVencidas++;
                    }
                    // Si no tiene ninguna modalidad, se cuenta en no_acreditadas (ya calculado arriba)
                }
                
                $totalNoAcreditadas = min($estadisticasCEUB['no_acreditadas'], $estadisticasARCUSUR['no_acreditadas']);

                $porcentajeCobertura = $totalCarreras > 0 ? 
                    round((($carrerasAcreditadas + $carrerasEnProceso) / $totalCarreras) * 100, 1) : 0;

                return [
                    'id' => $facultad->id,
                    'nombre_facultad' => $facultad->nombre_facultad,
                    'codigo_facultad' => $facultad->codigo_facultad,
                    'total_carreras' => $totalCarreras,
                    
                    // Estadísticas CEUB
                    'ceub' => $estadisticasCEUB,
                    'ceub_total' => $estadisticasCEUB['acreditadas'] + $estadisticasCEUB['en_proceso'],
                    
                    // Estadísticas ARCUSUR
                    'arcusur' => $estadisticasARCUSUR,
                    'arcusur_total' => $estadisticasARCUSUR['acreditadas'] + $estadisticasARCUSUR['en_proceso'],
                    
                    // Totales generales (carreras únicas, no suma de modalidades)
                    'total_acreditadas' => $carrerasAcreditadas,
                    'total_en_proceso' => $carrerasEnProceso,
                    'total_no_acreditadas' => $totalNoAcreditadas,
                    'total_vencidas' => $carrerasVencidas,
                    'porcentaje_cobertura' => $porcentajeCobertura,
                    
                    // Para compatibilidad con frontend existente
                    'carreras_acreditadas' => $carrerasAcreditadas,
                    'porcentaje_acreditacion' => $porcentajeCobertura
                ];
            });

            // Estadísticas generales consolidadas
            $estadisticasGenerales = [
                'total_facultades' => $facultades->count(),
                'total_carreras' => $reporteFacultades->sum('total_carreras'),
                
                // Totales por estado
                'total_acreditadas' => $reporteFacultades->sum('total_acreditadas'),
                'total_en_proceso' => $reporteFacultades->sum('total_en_proceso'),
                'total_no_acreditadas' => $reporteFacultades->sum('total_no_acreditadas'),
                'total_vencidas' => $reporteFacultades->sum('total_vencidas'),
                
                // Totales por modalidad
                'ceub_acreditadas' => $reporteFacultades->sum('ceub.acreditadas'),
                'ceub_en_proceso' => $reporteFacultades->sum('ceub.en_proceso'),
                'ceub_no_acreditadas' => $reporteFacultades->sum('ceub.no_acreditadas'),
                'ceub_vencidas' => $reporteFacultades->sum('ceub.vencidas'),
                
                'arcusur_acreditadas' => $reporteFacultades->sum('arcusur.acreditadas'),
                'arcusur_en_proceso' => $reporteFacultades->sum('arcusur.en_proceso'),
                'arcusur_no_acreditadas' => $reporteFacultades->sum('arcusur.no_acreditadas'),
                'arcusur_vencidas' => $reporteFacultades->sum('arcusur.vencidas'),
                
                // Porcentajes
                'porcentaje_cobertura_global' => $facultades->count() > 0 ? 
                    round($reporteFacultades->avg('porcentaje_cobertura'), 1) : 0,
                
                // Procesos activos y completados para compatibilidad
                'procesos_activos' => $reporteFacultades->sum('total_en_proceso'),
                'procesos_completados' => $reporteFacultades->sum('total_acreditadas')
            ];

            return response()->json([
                'exito' => true,
                'estado' => 200,
                'mensaje' => 'Reporte de facultades generado exitosamente',
                'datos' => [
                    'facultades' => $reporteFacultades,
                    'estadisticas_generales' => $estadisticasGenerales,
                    'filtros_aplicados' => [
                        'fecha' => $fecha ?? $fechaReferencia->format('Y-m-d'),
                        'facultad_id' => $facultadId ?? 'todas',
                        'modalidad_tipo' => $modalidadTipo
                    ]
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'exito' => false,
                'estado' => 500,
                'mensaje' => 'Error interno del servidor: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener datos detallados de una carrera para el reporte
     */
    private function obtenerDatosCarreraParaReporte($carrera, $fechaReferencia = null)
    {
        $acreditacionesQuery = CarreraModalidad::where('carrera_id', $carrera->id)
            ->with(['modalidad', 'fases']);

        if ($fechaReferencia) {
            $acreditacionesQuery->where('fecha_ini_aprobacion', '<=', $fechaReferencia)
                               ->where('fecha_fin_aprobacion', '>=', $fechaReferencia);
        }

        $acreditaciones = $acreditacionesQuery->get();

        $acreditacionesPorModalidad = [];
        
        foreach ($acreditaciones as $acreditacion) {
            $modalidadNombre = strtolower($acreditacion->modalidad->nombre_modalidad);
            $tipoModalidad = 'otra';
            
            if (stripos($modalidadNombre, 'ceub') !== false) {
                $tipoModalidad = 'ceub';
            } elseif (stripos($modalidadNombre, 'arcusur') !== false) {
                $tipoModalidad = 'arcusur';
            }

            // Determinar fase actual
            $faseActual = 'Sin definir';
            $ultimaFase = $acreditacion->fases()
                ->orderBy('fecha_inicio_fase', 'desc')
                ->first();
            
            if ($ultimaFase) {
                $faseActual = $ultimaFase->nombre_fase;
            }

            $acreditacionesPorModalidad[$tipoModalidad] = [
                'estado' => $acreditacion->estado_modalidad ? 'activa' : 'inactiva',
                'fecha_inicio' => $acreditacion->fecha_ini_proceso,
                'fecha_fin' => $acreditacion->fecha_fin_proceso,
                'fecha_vencimiento' => $acreditacion->fecha_fin_aprobacion,
                'fase_actual' => $faseActual,
                'total_fases' => $acreditacion->fases->count(),
                'fases_completadas' => $acreditacion->fases->where('estado_fase', true)->count()
            ];
        }

        return [
            'id' => $carrera->id,
            'nombre_carrera' => $carrera->nombre_carrera,
            'codigo_carrera' => $carrera->codigo_carrera,
            'pagina_carrera' => $carrera->pagina_carrera,
            'acreditaciones' => $acreditacionesPorModalidad
        ];
    }

    /**
     * Obtener estadísticas de acreditación por facultad específica
     */
    public function getEstadisticasFacultad(Request $request, $facultadId)
    {
        try {
            $fecha = $request->get('fecha');
            $modalidadId = $request->get('modalidad_id');
            $modalidadTipo = $request->get('modalidad_tipo', 'todos');
            
            // Si no se proporciona fecha, usar la fecha actual
            $fechaReferencia = $fecha ? Carbon::parse($fecha) : Carbon::now();
            
            $facultad = Facultad::with(['carreras'])->findOrFail($facultadId);
            
            $carreras = $facultad->carreras;
            $totalCarreras = $carreras->count();
            
            // Inicializar contadores para estadísticas de la facultad
            $estadisticasCEUB = [
                'acreditadas' => 0,
                'en_proceso' => 0,
                'no_acreditadas' => 0,
                'vencidas' => 0
            ];
            
            $estadisticasARCUSUR = [
                'acreditadas' => 0,
                'en_proceso' => 0,
                'no_acreditadas' => 0,
                'vencidas' => 0
            ];

            // Analizar cada carrera y generar datos detallados
            $carrerasDetalladas = [];
            $carrerasAcreditadas = 0;
            $carrerasEnProceso = 0;
            $carrerasVencidas = 0;
            $carrerasNoAcreditadas = 0;

            foreach ($carreras as $carrera) {
                // Buscar acreditaciones para esta carrera (aplicando filtro modalidadTipo)
                $acreditacionCEUB = null;
                if ($modalidadTipo === 'todos' || $modalidadTipo === 'ambas' || $modalidadTipo === 'ceub') {
                    $acreditacionesCEUB = CarreraModalidad::where('carrera_id', $carrera->id)
                        ->whereHas('modalidad', function($q) {
                            $q->where('nombre_modalidad', 'like', '%CEUB%');
                        })
                        ->when($modalidadId && $modalidadId !== 'todas', function($q) use ($modalidadId) {
                            $q->where('modalidad_id', $modalidadId);
                        })
                        ->with('modalidad')
                        ->get();
                    
                    $acreditacionCEUB = $this->encontrarAcreditacionVigente($acreditacionesCEUB, $fechaReferencia);
                }

                $acreditacionARCUSUR = null;
                if ($modalidadTipo === 'todos' || $modalidadTipo === 'ambas' || $modalidadTipo === 'arcusur') {
                    $acreditacionesARCUSUR = CarreraModalidad::where('carrera_id', $carrera->id)
                        ->whereHas('modalidad', function($q) {
                            $q->where('nombre_modalidad', 'like', '%ARCUSUR%');
                        })
                        ->when($modalidadId && $modalidadId !== 'todas', function($q) use ($modalidadId) {
                            $q->where('modalidad_id', $modalidadId);
                        })
                        ->with('modalidad')
                        ->get();
                    
                    $acreditacionARCUSUR = $this->encontrarAcreditacionVigente($acreditacionesARCUSUR, $fechaReferencia);
                }

                // Clasificar para estadísticas por modalidad
                if ($acreditacionCEUB) {
                    $estadisticasCEUB = $this->clasificarAcreditacion($acreditacionCEUB, $estadisticasCEUB, $fechaReferencia);
                } else {
                    $estadisticasCEUB['no_acreditadas']++;
                }

                if ($acreditacionARCUSUR) {
                    $estadisticasARCUSUR = $this->clasificarAcreditacion($acreditacionARCUSUR, $estadisticasARCUSUR, $fechaReferencia);
                } else {
                    $estadisticasARCUSUR['no_acreditadas']++;
                }

                // Determinar estado general de la carrera
                $tieneAcreditacionActiva = false;
                $tieneProcesoActivo = false;
                $tieneAcreditacionVencida = false;
                
                // Detalles específicos de cada modalidad para la carrera
                $ceubDetalle = null;
                $arcusurDetalle = null;

                // Debug para carrera específica
                if ($carrera->id == 44) {
                    \Log::info("=== DEBUG CARRERA 44 ===");
                    \Log::info("Modalidad tipo filtro: " . $modalidadTipo);
                    \Log::info("Acreditación CEUB: " . ($acreditacionCEUB ? 'ID ' . $acreditacionCEUB->id : 'null'));
                    \Log::info("Acreditación ARCUSUR: " . ($acreditacionARCUSUR ? 'ID ' . $acreditacionARCUSUR->id : 'null'));
                }

                foreach ([$acreditacionCEUB, $acreditacionARCUSUR] as $acreditacion) {
                    if ($acreditacion) {
                        $tipoModalidad = stripos($acreditacion->modalidad->nombre_modalidad, 'CEUB') !== false ? 'ceub' : 'arcusur';
                        
                        $detalle = [
                            'activa' => false,
                            'fecha_inicio' => $acreditacion->fecha_ini_proceso,
                            'fecha_fin_proceso' => $acreditacion->fecha_fin_proceso,
                            'fecha_vencimiento' => $acreditacion->fecha_fin_aprobacion,
                            'estado_modalidad' => $acreditacion->estado_modalidad,
                            'modalidad_nombre' => $acreditacion->modalidad->nombre_modalidad
                        ];

                        if ($acreditacion->fecha_ini_aprobacion && $acreditacion->fecha_fin_aprobacion) {
                            $fechaInicioAprobacion = Carbon::parse($acreditacion->fecha_ini_aprobacion);
                            $fechaFinAprobacion = Carbon::parse($acreditacion->fecha_fin_aprobacion);
                            if ($fechaReferencia->between($fechaInicioAprobacion, $fechaFinAprobacion)) {
                                $tieneAcreditacionActiva = true;
                                $detalle['activa'] = true;
                                $detalle['estado'] = 'acreditada';
                            } else {
                                $tieneAcreditacionVencida = true;
                                $detalle['estado'] = 'vencida';
                            }
                        } elseif ($acreditacion->fecha_ini_proceso && $acreditacion->estado_modalidad) {
                            $fechaInicio = Carbon::parse($acreditacion->fecha_ini_proceso);
                            // Verificar si el proceso estaba activo en la fecha de referencia
                            if ($fechaReferencia->greaterThanOrEqualTo($fechaInicio)) {
                                if ($acreditacion->fecha_fin_proceso) {
                                    $fechaFin = Carbon::parse($acreditacion->fecha_fin_proceso);
                                    if ($fechaReferencia->lessThanOrEqualTo($fechaFin)) {
                                        $tieneProcesoActivo = true;
                                        $detalle['estado'] = 'en_proceso';
                                    } else {
                                        $tieneAcreditacionVencida = true;
                                        $detalle['estado'] = 'proceso_terminado';
                                    }
                                } else {
                                    $tieneProcesoActivo = true;
                                    $detalle['estado'] = 'en_proceso';
                                }
                            } else {
                                // El proceso aún no había iniciado en la fecha de referencia
                                $tieneAcreditacionVencida = true;
                                $detalle['estado'] = 'proceso_no_iniciado';
                            }
                        } else {
                            $tieneAcreditacionVencida = true;
                            $detalle['estado'] = 'inactiva';
                        }

                        if ($tipoModalidad === 'ceub') {
                            $ceubDetalle = $detalle;
                        } else {
                            $arcusurDetalle = $detalle;
                        }
                    }
                }

                // Determinar estado general de la carrera
                $estadoCarrera = 'no_acreditada';
                if ($tieneAcreditacionActiva) {
                    $carrerasAcreditadas++;
                    $estadoCarrera = 'acreditada';
                } elseif ($tieneProcesoActivo) {
                    $carrerasEnProceso++;
                    $estadoCarrera = 'en_proceso';
                } elseif ($tieneAcreditacionVencida) {
                    $carrerasVencidas++;
                    $estadoCarrera = 'vencida';
                } else {
                    $carrerasNoAcreditadas++;
                    $estadoCarrera = 'no_acreditada';
                }

                // Obtener modalidades disponibles para la carrera
                $modalidades = $carrera->modalidades ?? [];

                $carrerasDetalladas[] = [
                    'id' => $carrera->id,
                    'nombre_carrera' => $carrera->nombre_carrera,
                    'codigo_carrera' => $carrera->codigo_carrera,
                    'estado_general' => $estadoCarrera,
                    'ceub_activa' => $ceubDetalle ? $ceubDetalle['activa'] : false,
                    'ceub_estado' => $ceubDetalle ? $ceubDetalle['estado'] : null,
                    'ceub_fecha_vencimiento' => $ceubDetalle ? $ceubDetalle['fecha_vencimiento'] : null,
                    'ceub_fase_actual' => null, // Se puede implementar más adelante
                    'arcusur_activa' => $arcusurDetalle ? $arcusurDetalle['activa'] : false,
                    'arcusur_estado' => $arcusurDetalle ? $arcusurDetalle['estado'] : null,
                    'arcusur_fecha_vencimiento' => $arcusurDetalle ? $arcusurDetalle['fecha_vencimiento'] : null,
                    'arcusur_fase_actual' => null, // Se puede implementar más adelante
                    'procesos_en_curso' => ($tieneProcesoActivo ? 1 : 0),
                    'modalidades' => $modalidades->map(function($modalidad) {
                        return [
                            'id' => $modalidad->id,
                            'nombre_modalidad' => $modalidad->nombre_modalidad
                        ];
                    })->toArray()
                ];
            }

            // Calcular porcentaje de cobertura
            $porcentajeCobertura = $totalCarreras > 0 ? 
                round((($carrerasAcreditadas + $carrerasEnProceso) / $totalCarreras) * 100, 1) : 0;

            return response()->json([
                'exito' => true,
                'estado' => 200,
                'mensaje' => 'Estadísticas de facultad obtenidas exitosamente',
                'datos' => [
                    'facultad' => [
                        'id' => $facultad->id,
                        'nombre' => $facultad->nombre_facultad,
                        'codigo' => $facultad->codigo_facultad
                    ],
                    'resumen' => [
                        'total_carreras' => $totalCarreras,
                        'carreras_acreditadas' => $carrerasAcreditadas,
                        'carreras_en_proceso' => $carrerasEnProceso,
                        'carreras_vencidas' => $carrerasVencidas,
                        'carreras_no_acreditadas' => $carrerasNoAcreditadas,
                        'porcentaje_cobertura' => $porcentajeCobertura,
                        
                        // Estadísticas por modalidad
                        'ceub' => $estadisticasCEUB,
                        'arcusur' => $estadisticasARCUSUR
                    ],
                    'carreras' => $carrerasDetalladas,
                    'filtros_aplicados' => [
                        'fecha' => $fecha ?? $fechaReferencia->format('Y-m-d'),
                        'modalidad_id' => $modalidadId ?? 'todas',
                        'modalidad_tipo' => $modalidadTipo ?? 'todos'
                    ]
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'exito' => false,
                'estado' => 500,
                'mensaje' => 'Error interno del servidor: ' . $e->getMessage()
            ], 500);
        }
    }

}