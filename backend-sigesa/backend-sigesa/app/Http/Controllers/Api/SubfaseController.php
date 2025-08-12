<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\SubFase;
use App\Exceptions\ApiException;

/**
 * @OA\Tag(
 *     name="Subfase",
 *     description="Operaciones relacionadas con las subfases del sistema de acreditación UMSS SIGESA",
 *     externalDocs={
 *         "description": "Documentación de la API",
 *         "url": "https://github.com/borisangulo/Sistema-de-Acreditacion-UMSS-SIGESA/blob/main/backend-sigesa/backend-sigesa/README.md"
 *     }
 * )
 */
class SubfaseController extends BaseApiController
{

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'fase_id' => 'required|exists:fases,id',
                'nombre_subfase' => 'required|string|max:50',
                'descripcion_subfase' => 'nullable|string|max:300',
                'fecha_inicio_subfase' => 'nullable|date',
                'fecha_fin_subfase' => 'nullable|date',
                'url_subfase' => 'nullable|string',
                'estado_subfase' => 'nullable|boolean',
                'id_usuario_updated_subfase' => 'nullable|integer',
            ]);

            $subfase = SubFase::create($validated);

            if (!$subfase) {
                throw ApiException::creationFailed('subfase');
            }

            return $this->successResponse($subfase, 'Subfase creada exitosamente', 201);

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
            $subfases = Subfase::all();
            
            if ($subfases->isEmpty()) {
                return $this->successResponse([], 'No hay subfases registradas', 200);
            }
            
            return $this->successResponse($subfases, 'Subfases obtenidas exitosamente');
        } catch (\Exception $e) {
            return $this->errorResponse('Error al obtener las subfases', 500, $e->getMessage());
        }
    }

    public function show($id)
    {
        try {
            $subfase = Subfase::find($id);

            if (!$subfase) {
                throw ApiException::notFound('subfase', $id);
            }

            return $this->successResponse($subfase, 'subfase encontrada');
        } catch (ApiException $e) {
            return $this->handleApiException($e);
        } catch (\Exception $e) {
            return $this->handleGeneralException($e);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $subfase = Subfase::find($id);

            if (!$subfase) {
                throw ApiException::notFound('subfase', $id);
            }

            $validated = $request->validate([
                'fase_id' => 'sometimes|required|exists:fases,id',
                'nombre_subfase' => 'sometimes|required|string|max:50',
                'descripcion_subfase' => 'nullable|string|max:300',
                'fecha_inicio_subfase' => 'nullable|date',
                'fecha_fin_subfase' => 'nullable|date',
                'url_subfase' => 'nullable|string',
                'estado_subfase' => 'nullable|boolean',
                'id_usuario_updated_subfase' => 'nullable|integer',
            ]);

            $updated = $subfase->update($validated);

            if (!$updated) {
                throw ApiException::updateFailed('subfase');
            }

            return $this->successResponse($subfase->fresh(), 'Subfase actualizada exitosamente');

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
            $subfase = SubFase::find($id);

            if (!$subfase) {
                throw ApiException::notFound('subfase', $id);
            }

            $deleted = $subfase->delete();

            if (!$deleted) {
                throw ApiException::deletionFailed('subfase');
            }

            return $this->successResponse(null, 'Subfase eliminada exitosamente', 200);

        } catch (ApiException $e) {
            return $this->handleApiException($e);
        } catch (\Exception $e) {
            return $this->handleGeneralException($e);
        }
    }

    /**
     * Obtener subfases de una fase específica
     * @OA\Get (
     *     path="/api/fases/{fase}/subfases",
     *     tags={"Subfase"},
     *     @OA\Parameter(
     *         name="fase",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer"),
     *         description="ID de la fase"
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="subfases de la fase obtenidas exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="exito", type="boolean", example=true),
     *             @OA\Property(property="estado", type="integer", example=200),
     *             @OA\Property(
     *                 property="datos",
     *                 type="array",
     *                 @OA\Items(
     *                     type="object",
     *                     @OA\Property(property="id", type="integer", example=1),
     *                     @OA\Property(property="fase_id", type="integer", example=1),
     *                     @OA\Property(property="nombre_subfase", type="string", example="subfase autoevaluacion"),
     *                     @OA\Property(property="descripcion_subfase", type="string", example="descripcion de la subfase de autoevaluacion"),
     *                     @OA\Property(property="fecha_inicio_subfase", type="string", format="date-time", example="2023-01-01T00:00:00Z"),
     *                     @OA\Property(property="fecha_fin_subfase", type="string", format="date-time", example="2023-01-31T23:59:59Z"),
     *                     @OA\Property(property="id_usuario_updated_subfase", type="integer", example=1),
     *                     @OA\Property(property="created_at", type="string", format="date-time", example="2023-01-01T00:00:00Z"),
     *                     @OA\Property(property="updated_at", type="string", format="date-time", example="2023-01-01T00:00:00Z")
     *                 )
     *             ),
     *             @OA\Property(property="error", type="string", nullable=true, example=null)
     *         )
     *     )
     * )
     */
    public function getByFase($faseId)
    {
        try {
            $subfases = Subfase::where('fase_id', $faseId)->get();

            if ($subfases->isEmpty()) {
                return $this->successResponse([], 'No hay subfases para esta fase', 200);
            }

            return $this->successResponse($subfases, 'Subfases obtenidas exitosamente');
        } catch (\Exception $e) {
            return $this->errorResponse('Error al obtener las subfases por fase', 500, $e->getMessage());
        }
    }
}
