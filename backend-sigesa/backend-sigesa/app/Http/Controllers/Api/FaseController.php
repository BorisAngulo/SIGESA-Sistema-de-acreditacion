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

    public function index()
    {
        try {
            $fases = Fase::all();
            
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
}
