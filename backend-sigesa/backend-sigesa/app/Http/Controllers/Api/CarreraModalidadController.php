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
}
