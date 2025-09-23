<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Plame;
use App\Models\FilaPlame;
use App\Models\ColumnaPlame;
use App\Models\RelacionPlame;
use App\Models\SubFase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Exceptions\ApiException;
use App\Traits\ApiResponseTrait;

class PlameController extends BaseApiController
{
    use ApiResponseTrait;

    /**
     * Obtener matriz PLAME por subfase
     */
    public function getPlameBySubfase($subfaseId)
    {
        try {
            $subfase = SubFase::find($subfaseId);
            if (!$subfase) {
                throw ApiException::notFound('subfase', $subfaseId);
            }

            // Obtener PLAME de la subfase
            $plame = Plame::where('id_subfase', $subfaseId)->first();

            if (!$plame) {
                // Si no existe, crear uno nuevo
                $plame = Plame::create([
                    'id_subfase' => $subfaseId,
                    'tipo_evaluacion_plame' => 'matriz'
                ]);
            }

            // Obtener filas y columnas según la modalidad de la carrera
            $modalidadId = $subfase->fase->carreraModalidad->modalidad_id;
            
            $filas = FilaPlame::where('id_modalidad', $modalidadId)->get();
            $columnas = ColumnaPlame::where('id_modalidad', $modalidadId)->get();

            // Obtener relaciones existentes
            $relaciones = RelacionPlame::where('id_plame', $plame->id)
                ->with(['filaPlame', 'columnaPlame'])
                ->get();

            // Crear matriz con las relaciones
            $matriz = [];
            foreach ($filas as $fila) {
                $matriz[$fila->id] = [];
                foreach ($columnas as $columna) {
                    $relacion = $relaciones->where('id_fila_plame', $fila->id)
                                          ->where('id_columna_plame', $columna->id)
                                          ->first();
                    
                    $matriz[$fila->id][$columna->id] = [
                        'valor' => $relacion ? $relacion->valor_relacion_plame : 0,
                        'relacion_id' => $relacion ? $relacion->id : null
                    ];
                }
            }

            return $this->successResponse([
                'plame' => $plame,
                'subfase' => $subfase,
                'filas' => $filas,
                'columnas' => $columnas,
                'matriz' => $matriz,
                'relaciones' => $relaciones
            ], 'Matriz PLAME obtenida exitosamente');

        } catch (ApiException $e) {
            return $this->handleApiException($e);
        } catch (\Exception $e) {
            return $this->handleGeneralException($e);
        }
    }

    /**
     * Actualizar valor en matriz PLAME
     */
    public function updateRelacionPlame(Request $request)
    {
        try {
            $validated = $request->validate([
                'id_plame' => 'required|exists:plames,id',
                'id_fila_plame' => 'required|exists:fila_plames,id',
                'id_columna_plame' => 'required|exists:columna_plames,id',
                'valor_relacion_plame' => 'required|integer|min:0|max:5'
            ]);

            // Buscar relación existente
            $relacion = RelacionPlame::where('id_plame', $validated['id_plame'])
                ->where('id_fila_plame', $validated['id_fila_plame'])
                ->where('id_columna_plame', $validated['id_columna_plame'])
                ->first();

            if ($relacion) {
                // Actualizar relación existente
                $relacion->update(['valor_relacion_plame' => $validated['valor_relacion_plame']]);
            } else {
                // Crear nueva relación
                $relacion = RelacionPlame::create($validated);
            }

            return $this->successResponse(
                $relacion->load(['plame', 'filaPlame', 'columnaPlame']),
                'Relación PLAME actualizada exitosamente'
            );

        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e);
        } catch (\Exception $e) {
            return $this->handleGeneralException($e);
        }
    }

    /**
     * Actualizar múltiples relaciones PLAME
     */
    public function updateMatrizPlame(Request $request)
    {
        try {
            $validated = $request->validate([
                'id_plame' => 'required|exists:plames,id',
                'relaciones' => 'required|array',
                'relaciones.*.id_fila_plame' => 'required|exists:fila_plames,id',
                'relaciones.*.id_columna_plame' => 'required|exists:columna_plames,id',
                'relaciones.*.valor_relacion_plame' => 'required|integer|min:0|max:5'
            ]);

            DB::beginTransaction();

            $relacionesActualizadas = [];

            foreach ($validated['relaciones'] as $relacionData) {
                $relacion = RelacionPlame::updateOrCreate(
                    [
                        'id_plame' => $validated['id_plame'],
                        'id_fila_plame' => $relacionData['id_fila_plame'],
                        'id_columna_plame' => $relacionData['id_columna_plame']
                    ],
                    [
                        'valor_relacion_plame' => $relacionData['valor_relacion_plame']
                    ]
                );

                $relacionesActualizadas[] = $relacion;
            }

            DB::commit();

            return $this->successResponse(
                $relacionesActualizadas,
                'Matriz PLAME actualizada exitosamente'
            );

        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            return $this->validationErrorResponse($e);
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->handleGeneralException($e);
        }
    }

    /**
     * Obtener filas PLAME por modalidad
     */
    public function getFilasByModalidad($modalidadId)
    {
        try {
            $filas = FilaPlame::where('id_modalidad', $modalidadId)->get();
            return $this->successResponse($filas, 'Filas PLAME obtenidas exitosamente');
        } catch (\Exception $e) {
            return $this->handleGeneralException($e);
        }
    }

    /**
     * Obtener columnas PLAME por modalidad
     */
    public function getColumnasByModalidad($modalidadId)
    {
        try {
            $columnas = ColumnaPlame::where('id_modalidad', $modalidadId)->get();
            return $this->successResponse($columnas, 'Columnas PLAME obtenidas exitosamente');
        } catch (\Exception $e) {
            return $this->handleGeneralException($e);
        }
    }

    /**
     * Resetear matriz PLAME
     */
    public function resetMatrizPlame($plameId)
    {
        try {
            $plame = Plame::find($plameId);
            if (!$plame) {
                throw ApiException::notFound('PLAME', $plameId);
            }

            // Eliminar todas las relaciones
            RelacionPlame::where('id_plame', $plameId)->delete();

            return $this->successResponse(null, 'Matriz PLAME reseteada exitosamente');

        } catch (ApiException $e) {
            return $this->handleApiException($e);
        } catch (\Exception $e) {
            return $this->handleGeneralException($e);
        }
    }

    /**
     * Obtener estadísticas de la matriz PLAME
     */
    public function getEstadisticasPlame($plameId)
    {
        try {
            $plame = Plame::find($plameId);
            if (!$plame) {
                throw ApiException::notFound('PLAME', $plameId);
            }

            $relaciones = RelacionPlame::where('id_plame', $plameId)->get();

            $estadisticas = [
                'total_relaciones' => $relaciones->count(),
                'valores_por_nivel' => [
                    '0' => $relaciones->where('valor_relacion_plame', 0)->count(),
                    '1' => $relaciones->where('valor_relacion_plame', 1)->count(),
                    '2' => $relaciones->where('valor_relacion_plame', 2)->count(),
                    '3' => $relaciones->where('valor_relacion_plame', 3)->count(),
                    '4' => $relaciones->where('valor_relacion_plame', 4)->count(),
                    '5' => $relaciones->where('valor_relacion_plame', 5)->count(),
                ],
                'promedio' => $relaciones->avg('valor_relacion_plame'),
                'maximo' => $relaciones->max('valor_relacion_plame'),
                'minimo' => $relaciones->min('valor_relacion_plame')
            ];

            return $this->successResponse($estadisticas, 'Estadísticas PLAME obtenidas exitosamente');

        } catch (ApiException $e) {
            return $this->handleApiException($e);
        } catch (\Exception $e) {
            return $this->handleGeneralException($e);
        }
    }
}
