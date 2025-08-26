<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\CarreraModalidad;
use App\Exceptions\ApiException;
/**
 * @OA\Tag(
 *     name="CarreraModalidad",
 *     description="Operaciones relacionadas con las modalidades asociadas a las carreras del sistema de acreditación UMSS SIGESA",
 *     externalDocs={
 *         "description": "Documentación de la API",
 *         "url": "https://github.com/borisangulo/Sistema-de-Acreditacion-UMSS-SIGESA/blob/main/backend-sigesa/backend-sigesa/README.md"
 *    }
 * )
 */
class CarreraModalidadController extends BaseApiController
{
    public function store(Request $request)
    {   
        try {
            $validated = $request->validate([
                'carrera_id' => 'required|exists:carreras,id',
                'modalidad_id' => 'required|exists:modalidades,id',
                'estado_modalidad' => 'boolean',
                'fecha_ini_proceso' => 'nullable|date',
                'fecha_fin_proceso' => 'nullable|date',
                'id_usuario_updated_carrera_modalidad' => 'nullable|integer',
                'fecha_ini_aprobacion' => 'nullable|date',
                'fecha_fin_aprobacion' => 'nullable|date',
                'certificado' => 'nullable|string',
            ]);

            $carreraModalidad = CarreraModalidad::create($validated);

            if (!$carreraModalidad) {
                throw ApiException::creationFailed('carrera-modalidad');
            }

            return $this->successResponse($carreraModalidad, 'carrera-modalidad creada exitosamente', 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->handleValidationException($e);
        } catch (ApiException $e) {
            return $this->handleApiException($e);
        } catch (\Exception $e) {
            return $this->handleGeneralException($e);
        }
    }

    public function index()
    {
        try {
            $carreraModalidad = CarreraModalidad::all();
            
            if ($carreraModalidad->isEmpty()) {
                return $this->successResponse([], 'No hay carreras-modalidades registradas', 200);
            }
            
            return $this->successResponse($carreraModalidad, 'Carreras-modalidades obtenidas exitosamente');
        } catch (\Exception $e) {
            return $this->errorResponse('Error al obtener las carreras-modalidades', 500, $e->getMessage());
        }
    }

    public function show($id)
    {
        try {
            $carreraModalidad = CarreraModalidad::find($id);

            if (!$carreraModalidad) {
                throw ApiException::notFound('carrera-modalidad', $id);
            }

            return $this->successResponse($carreraModalidad, 'Carrera-modalidad encontrada');
        } catch (ApiException $e) {
            return $this->handleApiException($e);
        } catch (\Exception $e) {
            return $this->handleGeneralException($e);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $carreraModalidad = CarreraModalidad::find($id);

            if (!$carreraModalidad) {
                throw ApiException::notFound('carrera-modalidad', $id);
            }

            $validated = $request->validate([
                'carrera_id' => 'sometimes|required|exists:carreras,id',
                'modalidad_id' => 'sometimes|required|exists:modalidades,id',
                'estado_modalidad' => 'sometimes|boolean',
                'fecha_ini_proceso' => 'nullable|date',
                'fecha_fin_proceso' => 'nullable|date',
                'id_usuario_updated_carrera_modalidad' => 'nullable|integer',
                'fecha_ini_aprobacion' => 'nullable|date',
                'fecha_fin_aprobacion' => 'nullable|date',
                'certificado' => 'nullable|string',
            ]);

            $updated = $carreraModalidad->update($validated);

            if (!$updated) {
                throw ApiException::updateFailed('carrera-modalidad');
            }

            return $this->successResponse($carreraModalidad->fresh(), 'Carrera-modalidad actualizada exitosamente');

        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->handleValidationException($e);
        } catch (ApiException $e) {
            return $this->handleApiException($e);
        } catch (\Exception $e) {
            return $this->handleGeneralException($e);
        }
    }

    public function destroy($id)
    {
        try {
            $carreraModalidad = CarreraModalidad::find($id);

            if (!$carreraModalidad) {
                throw ApiException::notFound('carrera-modalidad', $id);
            }

            $deleted = $carreraModalidad->delete();

            if (!$deleted) {
                throw ApiException::deletionFailed('carrera-modalidad');
            }

            return $this->successResponse(null, 'Carrera-modalidad eliminada exitosamente', 200);

        } catch (ApiException $e) {
            return $this->handleApiException($e);
        } catch (\Exception $e) {
            return $this->handleGeneralException($e);
        }
    }

    /**
     * @OA\Get(
     *     path="/api/carrera-modalidad/buscar-activa/{carrera_id}/{modalidad_id}",
     *     summary="Buscar carrera-modalidad activa dentro del rango de fechas actual",
     *     description="Busca una carrera-modalidad que esté activa (fecha actual entre fecha_ini_proceso y fecha_fin_proceso)",
     *     tags={"CarreraModalidad"},
     *     @OA\Parameter(
     *         name="carrera_id",
     *         in="path",
     *         required=true,
     *         description="ID de la carrera",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="modalidad_id",
     *         in="path",
     *         required=true,
     *         description="ID de la modalidad",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Carrera-modalidad activa encontrada",
     *         @OA\JsonContent(
     *             @OA\Property(property="exito", type="boolean", example=true),
     *             @OA\Property(property="mensaje", type="string", example="Carrera-modalidad activa encontrada"),
     *             @OA\Property(property="datos", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="No se encontró carrera-modalidad activa"
     *     )
     * )
     */
    public function buscarActiva($carrera_id, $modalidad_id)
    {
        try {
            $fechaActual = now()->toDateString();
            
            $carreraModalidadActiva = CarreraModalidad::with(['carrera:id,nombre_carrera', 'modalidad:id,nombre_modalidad'])
                ->where('carrera_id', $carrera_id)
                ->where('modalidad_id', $modalidad_id)
                ->where(function($query) use ($fechaActual) {
                    $query->where(function($subQuery) use ($fechaActual) {
                        // Caso 1: Ambas fechas están definidas y la fecha actual está en el rango
                        $subQuery->whereNotNull('fecha_ini_proceso')
                                ->whereNotNull('fecha_fin_proceso')
                                ->where('fecha_ini_proceso', '<=', $fechaActual)
                                ->where('fecha_fin_proceso', '>=', $fechaActual);
                    })
                    ->orWhere(function($subQuery) {
                        // Caso 2: Las fechas no están definidas (proceso permanente/sin límite)
                        $subQuery->whereNull('fecha_ini_proceso')
                                ->whereNull('fecha_fin_proceso');
                    });
                })
                ->first();

            if ($carreraModalidadActiva) {
                return $this->successResponse(
                    $carreraModalidadActiva, 
                    'Carrera-modalidad activa encontrada'
                );
            } else {
                return $this->successResponse(
                    null, 
                    'No se encontró carrera-modalidad activa para las fechas actuales',
                    404
                );
            }

        } catch (\Exception $e) {
            return $this->handleGeneralException($e);
        }
    }

    /**
     * @OA\Get(
     *     path="/api/carrera-modalidad/detalles-completos",
     *     summary="Obtener todas las carreras-modalidades con detalles completos",
     *     description="Retorna todas las carreras-modalidades con información de facultad, carrera, modalidad, y sus fases/subfases asociadas",
     *     tags={"CarreraModalidad"},
     *     @OA\Response(
     *         response=200,
     *         description="Lista de carreras-modalidades con detalles completos"
     *     )
     * )
     */
    public function getDetallesCompletos()
    {
        try {
            $carrerasModalidades = CarreraModalidad::with([
                'carrera.facultad',
                'modalidad',
                'fases.subfases'
            ])
            ->get()
            ->map(function ($carreraModalidad) {
                return [
                    'id' => $carreraModalidad->id,
                    'carrera_id' => $carreraModalidad->carrera_id,
                    'modalidad_id' => $carreraModalidad->modalidad_id,
                    'estado_modalidad' => $carreraModalidad->estado_modalidad,
                    'fecha_ini_proceso' => $carreraModalidad->fecha_ini_proceso,
                    'fecha_fin_proceso' => $carreraModalidad->fecha_fin_proceso,
                    'fecha_ini_aprobacion' => $carreraModalidad->fecha_ini_aprobacion,
                    'fecha_fin_aprobacion' => $carreraModalidad->fecha_fin_aprobacion,
                    'certificado' => $carreraModalidad->certificado,
                    'created_at' => $carreraModalidad->created_at,
                    'updated_at' => $carreraModalidad->updated_at,
                    'facultad' => [
                        'id' => $carreraModalidad->carrera->facultad->id,
                        'nombre_facultad' => $carreraModalidad->carrera->facultad->nombre_facultad,
                        'codigo_facultad' => $carreraModalidad->carrera->facultad->codigo_facultad,
                    ],
                    'carrera' => [
                        'id' => $carreraModalidad->carrera->id,
                        'nombre_carrera' => $carreraModalidad->carrera->nombre_carrera,
                        'codigo_carrera' => $carreraModalidad->carrera->codigo_carrera,
                    ],
                    'modalidad' => [
                        'id' => $carreraModalidad->modalidad->id,
                        'nombre_modalidad' => $carreraModalidad->modalidad->nombre_modalidad,
                        'descripcion_modalidad' => $carreraModalidad->modalidad->descripcion_modalidad,
                    ],
                    'total_fases' => $carreraModalidad->fases->count(),
                    'total_subfases' => $carreraModalidad->fases->sum(function ($fase) {
                        return $fase->subfases->count();
                    }),
                    'fases' => $carreraModalidad->fases->map(function ($fase) {
                        return [
                            'id' => $fase->id,
                            'nombre' => $fase->nombre_fase,
                            'descripcion' => $fase->descripcion_fase,
                            'fecha_inicio' => $fase->fecha_inicio_fase,
                            'fecha_fin' => $fase->fecha_fin_fase,
                            'estado_fase' => $fase->estado_fase,
                            'subfases_count' => $fase->subfases->count(),
                            'subfases' => $fase->subfases->map(function ($subfase) {
                                return [
                                    'id' => $subfase->id,
                                    'nombre' => $subfase->nombre_subfase,
                                    'descripcion' => $subfase->descripcion_subfase,
                                    'fecha_inicio' => $subfase->fecha_inicio_subfase,
                                    'fecha_fin' => $subfase->fecha_fin_subfase,
                                    'estado_subfase' => $subfase->estado_subfase,
                                ];
                            })
                        ];
                    })
                ];
            });

            return $this->successResponse(
                $carrerasModalidades, 
                'Carreras-modalidades con detalles completos obtenidas exitosamente'
            );

        } catch (\Exception $e) {
            return $this->handleGeneralException($e);
        }
    }
}
