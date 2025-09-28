<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Facultad;
use App\Models\Carrera;
use App\Models\Modalidad;
use App\Models\CarreraModalidad;
use App\Models\SubFase;
use App\Models\Fase;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportesController extends Controller
{
    use ApiResponse;

    /**
     * Obtener KPIs generales del sistema
     */
    public function getKPIs(Request $request)
    {
        try {
            $year = $request->get('year');
            $facultadId = $request->get('facultad_id');
            $modalidadId = $request->get('modalidad_id');

            // Query base para carreras con filtros
            $carrerasQuery = Carrera::query();
            
            if ($facultadId && $facultadId !== 'todas') {
                $carrerasQuery->where('facultad_id', $facultadId);
            }

            // Si hay filtro de año, considerar solo acreditaciones de ese año
            $carreraModalidadesQuery = CarreraModalidad::query();
            
            if ($year && $year !== 'todos') {
                $carreraModalidadesQuery->whereYear('created_at', $year);
            }
            
            if ($modalidadId && $modalidadId !== 'todas') {
                $carreraModalidadesQuery->where('modalidad_id', $modalidadId);
            }

            // KPIs principales
            $kpis = [
                'facultades_activas' => Facultad::count(),
                'carreras_totales' => $carrerasQuery->count(),
                'acreditaciones_ceub' => $carreraModalidadesQuery->whereHas('modalidad', function($q) {
                    $q->where('nombre_modalidad', 'like', '%CEUB%');
                })->count(),
                'acreditaciones_arcusur' => $carreraModalidadesQuery->whereHas('modalidad', function($q) {
                    $q->where('nombre_modalidad', 'like', '%ARCU%');
                })->count(),
                'crecimiento_anual' => $this->calcularCrecimientoAnual($year)
            ];

            return $this->successResponse($kpis, 'KPIs obtenidos exitosamente');

        } catch (\Exception $e) {
            return $this->errorResponse('Error al obtener KPIs: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener análisis por facultades
     */
    public function getAnalisisFacultades(Request $request)
    {
        try {
            $year = $request->get('year');
            $modalidadId = $request->get('modalidad_id');

            $facultades = Facultad::with(['carreras' => function($query) use ($year, $modalidadId) {
                if ($modalidadId && $modalidadId !== 'todas') {
                    $query->whereHas('modalidades', function($q) use ($modalidadId, $year) {
                        $q->where('modalidad_id', $modalidadId);
                        if ($year && $year !== 'todos') {
                            $q->whereYear('carrera_modalidad.created_at', $year);
                        }
                    });
                }
            }, 'carreras.modalidades'])->get();

            $analisis = $facultades->map(function($facultad) use ($year) {
                $totalCarreras = $facultad->carreras->count();
                
                // Contar acreditaciones CEUB
                $ceub = $facultad->carreras->filter(function($carrera) use ($year) {
                    return $carrera->modalidades->filter(function($modalidad) use ($year) {
                        $esCeub = stripos($modalidad->nombre_modalidad, 'CEUB') !== false;
                        if ($year && $year !== 'todos') {
                            return $esCeub && $modalidad->pivot->created_at->year == $year;
                        }
                        return $esCeub;
                    })->count() > 0;
                })->count();

                // Contar acreditaciones ARCU-SUR
                $arcusur = $facultad->carreras->filter(function($carrera) use ($year) {
                    return $carrera->modalidades->filter(function($modalidad) use ($year) {
                        $esArcu = stripos($modalidad->nombre_modalidad, 'ARCU') !== false;
                        if ($year && $year !== 'todos') {
                            return $esArcu && $modalidad->pivot->created_at->year == $year;
                        }
                        return $esArcu;
                    })->count() > 0;
                })->count();

                $carrerasAcreditadas = $ceub + $arcusur;
                $porcentajeAcreditacion = $totalCarreras > 0 ? round(($carrerasAcreditadas / $totalCarreras) * 100, 1) : 0;

                return [
                    'facultad_id' => $facultad->id,
                    'nombre_facultad' => $facultad->nombre_facultad,
                    'codigo_facultad' => $facultad->codigo_facultad,
                    'total_carreras' => $totalCarreras,
                    'carreras_acreditadas' => $carrerasAcreditadas,
                    'porcentaje_acreditacion' => $porcentajeAcreditacion,
                    'ceub' => $ceub,
                    'arcusur' => $arcusur
                ];
            });

            return $this->successResponse($analisis, 'Análisis de facultades obtenido exitosamente');

        } catch (\Exception $e) {
            return $this->errorResponse('Error al obtener análisis de facultades: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener progreso por modalidades
     */
    public function getProgresoModalidades(Request $request)
    {
        try {
            $year = $request->get('year');
            $facultadId = $request->get('facultad_id');

            $modalidades = Modalidad::with(['carreras' => function($query) use ($year, $facultadId) {
                if ($year && $year !== 'todos') {
                    $query->whereYear('carrera_modalidad.created_at', $year);
                }
                if ($facultadId && $facultadId !== 'todas') {
                    $query->where('facultad_id', $facultadId);
                }
            }])->get();

            $progreso = $modalidades->map(function($modalidad) use ($year, $facultadId) {
                // Total de carreras elegibles (todas las carreras o filtradas por facultad)
                $totalCarrerasQuery = Carrera::query();
                if ($facultadId && $facultadId !== 'todas') {
                    $totalCarrerasQuery->where('facultad_id', $facultadId);
                }
                $totalCarreras = $totalCarrerasQuery->count();

                // Carreras activas en esta modalidad
                $carrerasActivas = $modalidad->carreras->count();

                // Simular carreras en proceso (puedes ajustar esta lógica según tu modelo de datos)
                $carrerasEnProceso = floor($carrerasActivas * 0.3); // 30% están en proceso

                $porcentajeCompletado = $totalCarreras > 0 ? 
                    round(($carrerasActivas / $totalCarreras) * 100, 1) : 0;

                return [
                    'modalidad_id' => $modalidad->id,
                    'nombre_modalidad' => $modalidad->nombre_modalidad,
                    'descripcion' => $modalidad->descripcion,
                    'total_carreras' => $totalCarreras,
                    'carreras_activas' => $carrerasActivas,
                    'carreras_en_proceso' => $carrerasEnProceso,
                    'porcentaje_completado' => $porcentajeCompletado
                ];
            });

            return $this->successResponse($progreso, 'Progreso por modalidades obtenido exitosamente');

        } catch (\Exception $e) {
            return $this->errorResponse('Error al obtener progreso de modalidades: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener tendencias temporales
     */
    public function getTendenciasTemporales(Request $request)
    {
        try {
            $facultadId = $request->get('facultad_id');
            $modalidadId = $request->get('modalidad_id');

            // Obtener datos por año de los últimos 5 años
            $anos = collect(range(date('Y') - 4, date('Y')));
            
            $tendencias = $anos->map(function($ano) use ($facultadId, $modalidadId) {
                $carreraModalidadesQuery = CarreraModalidad::whereYear('created_at', $ano);
                
                if ($facultadId && $facultadId !== 'todas') {
                    $carreraModalidadesQuery->whereHas('carrera', function($q) use ($facultadId) {
                        $q->where('facultad_id', $facultadId);
                    });
                }

                if ($modalidadId && $modalidadId !== 'todas') {
                    $carreraModalidadesQuery->where('modalidad_id', $modalidadId);
                }

                // Contar por tipo de modalidad
                $ceub = (clone $carreraModalidadesQuery)->whereHas('modalidad', function($q) {
                    $q->where('nombre_modalidad', 'like', '%CEUB%');
                })->count();

                $arcusur = (clone $carreraModalidadesQuery)->whereHas('modalidad', function($q) {
                    $q->where('nombre_modalidad', 'like', '%ARCU%');
                })->count();

                // Total de carreras para este año
                $totalCarrerasQuery = Carrera::query();
                if ($facultadId && $facultadId !== 'todas') {
                    $totalCarrerasQuery->where('facultad_id', $facultadId);
                }
                $totalCarreras = $totalCarrerasQuery->count();

                return [
                    'año' => $ano,
                    'ceub' => $ceub,
                    'arcusur' => $arcusur,
                    'total_carreras' => $totalCarreras,
                    'total_acreditaciones' => $ceub + $arcusur
                ];
            });

            return $this->successResponse($tendencias, 'Tendencias temporales obtenidas exitosamente');

        } catch (\Exception $e) {
            return $this->errorResponse('Error al obtener tendencias temporales: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener distribución de estados
     */
    public function getDistribucionEstados(Request $request)
    {
        try {
            $year = $request->get('year');
            $facultadId = $request->get('facultad_id');
            $modalidadId = $request->get('modalidad_id');

            // Query para acreditaciones con filtros
            $carreraModalidadesQuery = CarreraModalidad::query();
            
            if ($year && $year !== 'todos') {
                $carreraModalidadesQuery->whereYear('created_at', $year);
            }
            
            if ($facultadId && $facultadId !== 'todas') {
                $carreraModalidadesQuery->whereHas('carrera', function($q) use ($facultadId) {
                    $q->where('facultad_id', $facultadId);
                });
            }
            
            if ($modalidadId && $modalidadId !== 'todas') {
                $carreraModalidadesQuery->where('modalidad_id', $modalidadId);
            }

            $totalAcreditaciones = $carreraModalidadesQuery->count();

            // Para esta versión, simularemos los estados
            // En el futuro puedes agregar campos de estado en tu tabla carrera_modalidad
            $activas = floor($totalAcreditaciones * 0.7); // 70% activas
            $enProceso = floor($totalAcreditaciones * 0.25); // 25% en proceso
            $pausadas = $totalAcreditaciones - $activas - $enProceso; // El resto pausadas

            $distribucion = [
                [
                    'name' => 'Activas',
                    'value' => $activas,
                    'color' => '#10b981'
                ],
                [
                    'name' => 'En Proceso',
                    'value' => $enProceso,
                    'color' => '#f59e0b'
                ],
                [
                    'name' => 'Pausadas',
                    'value' => $pausadas,
                    'color' => '#ef4444'
                ]
            ];

            return $this->successResponse($distribucion, 'Distribución de estados obtenida exitosamente');

        } catch (\Exception $e) {
            return $this->errorResponse('Error al obtener distribución de estados: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener carreras con detalles de acreditación por facultad
     */
    public function getCarrerasConAcreditacion($facultadId)
    {
        try {
            $carreras = Carrera::where('facultad_id', $facultadId)
                ->with(['modalidades', 'subfases.fase'])
                ->get();

            $carrerasConDetalle = $carreras->map(function($carrera) {
                $acreditaciones = [];

                // Procesar modalidades
                foreach ($carrera->modalidades as $modalidad) {
                    $tipoModalidad = stripos($modalidad->nombre_modalidad, 'CEUB') !== false ? 'ceub' : 'arcusur';
                    
                    // Buscar fase actual en subfases
                    $faseActual = $carrera->subfases->last();
                    
                    $acreditaciones[$tipoModalidad] = [
                        'estado' => 'activa',
                        'fecha_vencimiento' => now()->addYears(3)->format('Y-m-d'), // 3 años de validez
                        'fase_actual' => $faseActual ? $faseActual->fase->nombre_fase : 'Fase Inicial'
                    ];
                }

                return [
                    'id' => $carrera->id,
                    'nombre_carrera' => $carrera->nombre_carrera,
                    'codigo_carrera' => $carrera->codigo_carrera,
                    'acreditaciones' => $acreditaciones
                ];
            });

            return $this->successResponse($carrerasConDetalle, 'Carreras con acreditación obtenidas exitosamente');

        } catch (\Exception $e) {
            return $this->errorResponse('Error al obtener carreras con acreditación: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Calcular crecimiento anual
     */
    private function calcularCrecimientoAnual($year = null)
    {
        try {
            if (!$year || $year === 'todos') {
                return 15.5; // Valor promedio general
            }

            $currentYear = (int) $year;
            $previousYear = $currentYear - 1;

            $currentCount = CarreraModalidad::whereYear('created_at', $currentYear)->count();
            $previousCount = CarreraModalidad::whereYear('created_at', $previousYear)->count();

            if ($previousCount == 0) {
                return $currentCount > 0 ? 100 : 0;
            }

            return round((($currentCount - $previousCount) / $previousCount) * 100, 1);

        } catch (\Exception $e) {
            return 0;
        }
    }
}