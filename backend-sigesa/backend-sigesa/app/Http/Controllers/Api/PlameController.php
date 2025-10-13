<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Plame;
use App\Models\FilaPlame;
use App\Models\ColumnaPlame;
use App\Models\RelacionPlame;
use App\Models\CarreraModalidad;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Exceptions\ApiException;
use App\Traits\ApiResponseTrait;

class PlameController extends BaseApiController
{
    use ApiResponseTrait;

    /**
     * Verificar si existe PLAME para carrera-modalidad
     */
    public function verificarPlameExiste($carreraModalidadId)
    {
        try {
            $carreraModalidad = CarreraModalidad::find($carreraModalidadId);
            if (!$carreraModalidad) {
                throw ApiException::notFound('carrera-modalidad', $carreraModalidadId);
            }

            $plameExiste = Plame::where('id_carreraModalidad', $carreraModalidadId)->exists();

            return $this->successResponse([
                'existe' => $plameExiste,
                'carrera_modalidad_id' => $carreraModalidadId,
                'carrera' => $carreraModalidad->carrera?->nombre,
                'modalidad' => $carreraModalidad->modalidad?->nombre
            ], $plameExiste ? 'PLAME existe para esta carrera-modalidad' : 'PLAME no existe para esta carrera-modalidad');

        } catch (ApiException $e) {
            return $this->handleApiException($e);
        } catch (\Exception $e) {
            return $this->handleGeneralException($e);
        }
    }

    /**
     * Obtener matriz PLAME por carrera-modalidad (crear si no existe)
     */
    public function getPlameByCarreraModalidad($carreraModalidadId)
    {
        try {
            $carreraModalidad = CarreraModalidad::with(['carrera', 'modalidad'])->find($carreraModalidadId);
            if (!$carreraModalidad) {
                throw ApiException::notFound('carrera-modalidad', $carreraModalidadId);
            }

            // Obtener PLAME de la carrera-modalidad
            $plame = Plame::where('id_carreraModalidad', $carreraModalidadId)->first();

            $esNuevo = false;
            if (!$plame) {
                // Si no existe, crear uno nuevo
                $plame = Plame::create([
                    'id_carreraModalidad' => $carreraModalidadId,
                    'tipo_evaluacion_plame' => 'matriz'
                ]);
                $esNuevo = true;
                
                \Log::info("Nueva matriz PLAME creada para carrera-modalidad: {$carreraModalidadId}");
            }

            // Obtener filas y columnas
            $modalidadId = $carreraModalidad->modalidad_id;
            
            // Las filas dependen de la modalidad
            $filas = FilaPlame::where('id_modalidad', $modalidadId)->get();
            // Las columnas son genéricas para todas las modalidades
            $columnas = ColumnaPlame::all();

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

            $mensaje = $esNuevo 
                ? 'Nueva matriz PLAME creada y obtenida exitosamente' 
                : 'Matriz PLAME obtenida exitosamente';

            return $this->successResponse([
                'plame' => $plame,
                'carreraModalidad' => $carreraModalidad,
                'filas' => $filas,
                'columnas' => $columnas,
                'matriz' => $matriz,
                'relaciones' => $relaciones,
                'esNuevo' => $esNuevo
            ], $mensaje);

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
     * Obtener columnas PLAME (genéricas para todas las modalidades)
     * Nota: Mantiene el parámetro modalidadId por compatibilidad con rutas existentes
     */
    public function getColumnasByModalidad($modalidadId = null)
    {
        try {
            // Las columnas son genéricas, no dependen de la modalidad
            $columnas = ColumnaPlame::all();
            return $this->successResponse($columnas, 'Columnas PLAME obtenidas exitosamente');
        } catch (\Exception $e) {
            return $this->handleGeneralException($e);
        }
    }

    /**
     * Obtener todas las columnas PLAME
     */
    public function getColumnas()
    {
        try {
            $columnas = ColumnaPlame::all();
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
