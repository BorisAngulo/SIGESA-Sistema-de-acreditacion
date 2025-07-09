<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Exceptions\ApiException;

use App\Models\Modalidad;
/**
* @OA\Tag(
*     name="Modalidad",
*     description="Operaciones relacionadas con las modalidades del sistema de acreditación UMSS SIGESA",
*     externalDocs={
*         "description": "Documentación de la API",
*         "url": "https://github.com/borisangulo/Sistema-de-Acreditacion-UMSS-SIGESA/blob/main/backend-sigesa/backend-sigesa/README.md"
*     }
* )
 */
class ModalidadController extends BaseApiController
{

    public function store(Request $request)
    {   
        try{
            $validated = $request->validate([
                'codigo_modalidad' => 'required|string|unique:modalidades,codigo_modalidad',
                'nombre_modalidad' => 'required|string|max:50',
                'descripcion_modalidad' => 'nullable|string|max:255',
                'id_usuario_updated_modalidad' => 'nullable|integer',
            ]);

            if (Modalidad::where('codigo_modalidad', $validated['codigo_modalidad'])->exists()){
                throw ApiException::alreadyExists('modalidad', 'código', $validated['codigo_modalidad']);
            }

            $modalidad = Modalidad::create($validated);

            if( !$modalidad) {
                throw ApiException::creationFailed('modalidad');
            }

            return $this->successResponse($modalidad, 'Modalidad creada exitosamente', 201);

        }catch (\Illuminate\Validation\ValidationException $e) {
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
            $modalidades = Modalidad::all();

            if ($modalidades -> isEmpty()){
                return $this->successResponse([], 'No hay modalidades registradas');
            }

            return $this->successResponse($modalidades, 'Modalidades obtenidas exitosamente');
        } catch (\Exception $e) {
            return $this-> errorResponse('Error al obtener las facultades', 500, $e->getMessage());
        }
    }

    public function show($id)
    {
        try {
            $modalidad = Modalidad::find($id);

            if (!$modalidad) {
                throw ApiException::notFound('modalidad', $id);
            }

            return $this->successResponse($modalidad, 'Modalidad encontrada');
        } catch (ApiException $e) {
            return $this->handleApiException($e);
        } catch (\Exception $e) {
            return $this->handleGeneralException($e);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $modalidad = Modalidad::find($id);

            if (!$modalidad) {
                throw ApiException::notFound('modalidad', $id);
            }

            $validated = $request->validate([
                'codigo_modalidad' => 'sometimes|required|string|unique:modalidades,codigo_modalidad',
                'nombre_modalidad' => 'sometimes|required|string|max:50',
                'descripcion_modalidad' => 'nullable|string|max:255',
                'id_usuario_updated_modalidad' => 'nullable|integer',
            ]);

            $updated = $modalidad->update($validated);

            if (!$updated) {
                throw ApiException::updateFailed('modalidad');
            }

            return $this->successResponse($modalidad->fresh(), 'modalidad actualizada exitosamente');

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
            $modalidad = Modalidad::find($id);

            if (!$modalidad) {
                throw ApiException::notFound('modalidad', $id);
            }

            $deleted = $modalidad->delete();

            if (!$deleted) {
                throw ApiException::deletionFailed('modalidad');
            }

            return $this->successResponse(null, 'Modalidad eliminada exitosamente', 200);

        } catch (ApiException $e) {
            return $this->handleApiException($e);
        } catch (\Exception $e) {
            return $this->handleGeneralException($e);
        }
    }
}
