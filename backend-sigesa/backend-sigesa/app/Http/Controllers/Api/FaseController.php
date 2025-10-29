<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Fase;
use App\Exceptions\ApiException;
/**
* @OA\Tag(
*     name="Fase",
*     description="Operaciones relacionadas con las fases del sistema de acreditación UMSS SIGESA",
*     externalDocs={
*         "description": "Documentación de la API",
*         "url": "https://github.com/borisangulo/Sistema-de-Acreditacion-UMSS-SIGESA/blob/main/backend-sigesa/backend-sigesa/README.md"
*     }
* )
 */
class FaseController extends BaseApiController
{

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'carrera_modalidad_id' => 'required|exists:carrera_modalidades,id',
                'nombre_fase' => 'required|string|max:50',
                'descripcion_fase' => 'nullable|string|max:300',
                'fecha_inicio_fase' => 'nullable|date',
                'fecha_fin_fase' => 'nullable|date',
                'url_fase' => 'nullable|string',
                'url_fase_respuesta' => 'nullable|string',
                'observacion_fase' => 'nullable|string|max:300',
                'estado_fase' => 'nullable|boolean',
                'id_usuario_updated_fase' => 'nullable|integer',
            ]);

            $fase = Fase::create($validated);

            if (!$fase) {
                throw ApiException::creationFailed('fase');
            }

            return $this->successResponse($fase, 'Fase creada exitosamente', 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->handleValidationException($e);
        } catch (ApiException $e) {
            return $this->handleApiException($e);
        } catch (\Exception $e) {
            return $this->handleGeneralException($e);
        }
    }

    public function index(Request $request)
    {
        try {
            $query = Fase::query();

            // Filtrar por carrera_modalidad_id si se envía en la query string
            if ($request->has('carrera_modalidad_id')) {
                $query->where('carrera_modalidad_id', $request->input('carrera_modalidad_id'));
            }

            $fases = $query->get();

            if ($fases->isEmpty()) {
                return $this->successResponse([], 'No hay fases registradas', 200);
            }

            return $this->successResponse($fases, 'Fases obtenidas exitosamente');
        } catch (\Exception $e) {
            return $this->errorResponse('Error al obtener las fases', 500, $e->getMessage());
        }
    }

    public function show($id)
    {
        try {
            $fase = Fase::find($id);

            if (!$fase) {
                throw ApiException::notFound('fase', $id);
            }

            return $this->successResponse($fase, 'fase encontrada');
        } catch (ApiException $e) {
            return $this->handleApiException($e);
        } catch (\Exception $e) {
            return $this->handleGeneralException($e);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $fase = Fase::find($id);

            if (!$fase) {
                throw ApiException::notFound('fase', $id);
            }

            $validated = $request->validate([
                'carrera_modalidad_id' => 'sometimes|required|exists:carrera_modalidades,id',
                'nombre_fase' => 'sometimes|required|string|max:50',
                'descripcion_fase' => 'nullable|string|max:300',
                'fecha_inicio_fase' => 'nullable|date',
                'fecha_fin_fase' => 'nullable|date',
                'url_fase' => 'nullable|string',
                'url_fase_respuesta' => 'nullable|string',
                'observacion_fase' => 'nullable|string|max:300',
                'estado_fase' => 'nullable|boolean',
                'id_usuario_updated_fase' => 'nullable|integer',
            ]);

            $updated = $fase->update($validated);

            if (!$updated) {
                throw ApiException::updateFailed('fase');
            }

            return $this->successResponse($fase->fresh(), 'Fase actualizada exitosamente');

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
            $fase = Fase::find($id);

            if (!$fase) {
                throw ApiException::notFound('fase', $id);
            }

            $deleted = $fase->delete();

            if (!$deleted) {
                throw ApiException::deletionFailed('fase');
            }

            return $this->successResponse(null, 'Fase eliminada exitosamente', 200);

        } catch (ApiException $e) {
            return $this->handleApiException($e);
        } catch (\Exception $e) {
            return $this->handleGeneralException($e);
        }
    }

    /**
     * @OA\Get(
     *     path="/api/fases/{id}/avance",
     *     summary="Obtener el porcentaje de avance de una fase",
     *     description="Calcula el porcentaje de avance de una fase basado en las subfases completadas (estado_subfase=true)",
     *     tags={"Fase"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID de la fase",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Porcentaje de avance obtenido exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="exito", type="boolean", example=true),
     *             @OA\Property(property="estado", type="integer", example=200),
     *             @OA\Property(property="mensaje", type="string", example="Avance de fase obtenido exitosamente"),
     *             @OA\Property(
     *                 property="datos",
     *                 type="object",
     *                 @OA\Property(property="fase_id", type="integer", example=1),
     *                 @OA\Property(property="nombre_fase", type="string", example="Fase de Autoevaluación"),
     *                 @OA\Property(property="total_subfases", type="integer", example=5),
     *                 @OA\Property(property="subfases_completadas", type="integer", example=3),
     *                 @OA\Property(property="porcentaje_avance", type="integer", example=60)
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Fase no encontrada",
     *         @OA\JsonContent(
     *             @OA\Property(property="exito", type="boolean", example=false),
     *             @OA\Property(property="estado", type="integer", example=404),
     *             @OA\Property(property="mensaje", type="string", example="Fase no encontrada"),
     *             @OA\Property(property="error", type="object")
     *         )
     *     )
     * )
     */
    public function getAvance($id)
    {
        try {
            $fase = Fase::with('subfases')->find($id);

            if (!$fase) {
                throw ApiException::notFound('fase', $id);
            }

            // Obtener todas las subfases de la fase
            $totalSubfases = $fase->subfases->count();
            
            // Contar las subfases completadas (estado_subfase = true)
            $subfasesCompletadas = $fase->subfases->where('estado_subfase', true)->count();

            // Calcular el porcentaje de avance
            $porcentajeAvance = $totalSubfases > 0 
                ? (int) round(($subfasesCompletadas / $totalSubfases) * 100) 
                : 0;

            $resultado = [
                'fase_id' => $fase->id,
                'nombre_fase' => $fase->nombre_fase,
                'total_subfases' => $totalSubfases,
                'subfases_completadas' => $subfasesCompletadas,
                'porcentaje_avance' => $porcentajeAvance
            ];

            return $this->successResponse($resultado, 'Avance de fase obtenido exitosamente');

        } catch (ApiException $e) {
            return $this->handleApiException($e);
        } catch (\Exception $e) {
            return $this->handleGeneralException($e);
        }
    }
}
