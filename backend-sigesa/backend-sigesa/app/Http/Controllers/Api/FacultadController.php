<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Facultad;
use App\Exceptions\ApiException;

/**
* @OA\Info(
*             title="Api Sistema de Acreditación UMSS SIGESA", 
*             version="1.0",
*             description="Documentación de la API del Sistema de Acreditación UMSS SIGESA",
*             @OA\Contact(
*                 email="borisanthony03@gmail.com",
*                 name="Boris Anthony Angulo Urquieta",
*                 url="https://github.com/borisangulo/Sistema-de-Acreditacion-UMSS-SIGESA"
*             ),
*             @OA\License(
*                 name="MIT",
*                 url="https://opensource.org/licenses/MIT"
*             )
*         ),
* @OA\Tag(
*     name="Facultad",
*     description="Operaciones relacionadas con las facultades del sistema de acreditación UMSS SIGESA",
*     externalDocs={
*         "description": "Documentación de la API",
*         "url": "https://github.com/borisangulo/Sistema-de-Acreditacion-UMSS-SIGESA/blob/main/backend-sigesa/backend-sigesa/README.md"
*     }
* )
*
* @OA\Server(url="http://127.0.0.1:8000")
*/
class FacultadController extends BaseApiController
{   

/**
     * Listado de todas las facultades
     * @OA\Get (
     *     path="/api/facultades",
     *     tags={"Facultad"},
     *     @OA\Response(
     *         response=200,
     *         description="OK",
     *         @OA\JsonContent(
     *             @OA\Property(property="exito", type="boolean", example=true),
     *             @OA\Property(property="estado", type="integer", example=200),
     *             @OA\Property(
     *                 property="datos",
     *                 type="array",
     *                 @OA\Items(
     *                     type="object",
     *                     @OA\Property(property="id", type="number", example="1"),
     *                     @OA\Property(property="nombre_facultad", type="string", example="Facultad de Ciencias y Tecnología"),
     *                     @OA\Property(property="codigo_facultad", type="string", example="FCyT"),
     *                     @OA\Property(property="pagina_facultad", type="string", example="https://fcyt.umss.edu.bo"),
     *                     @OA\Property(property="created_at", type="string", example="2023-02-23T00:09:16.000000Z"),
     *                     @OA\Property(property="updated_at", type="string", example="2023-02-23T12:33:45.000000Z")
     *                 )
     *             ),
     *             @OA\Property(property="error", type="string", nullable=true, example=null)
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Error interno del servidor",
     *         @OA\JsonContent(
     *             @OA\Property(property="exito", type="boolean", example=false),
     *             @OA\Property(property="estado", type="integer", example=500),
     *             @OA\Property(property="datos", type="string", nullable=true, example=null),
     *             @OA\Property(property="error", type="string", example="Error al obtener las facultades: mensaje de error")
     *         )
     *     )
     * )
     */
    public function index()
    {
        try {
            $facultades = Facultad::all();
            
            if ($facultades->isEmpty()) {
                return $this->successResponse([], 'No hay facultades registradas', 200);
            }
            
            return $this->successResponse($facultades, 'Facultades obtenidas exitosamente');
        } catch (\Exception $e) {
            return $this->errorResponse('Error al obtener las facultades', 500, $e->getMessage());
        }
    }

/**
     * Crear una nueva facultad
     * @OA\Post (
     *     path="/api/facultades",
     *     tags={"Facultad"},
     *     @OA\RequestBody(
     *         @OA\MediaType(
     *             mediaType="application/json",
     *             @OA\Schema(
     *                 @OA\Property(
     *                     property="nombre_facultad",
     *                     type="string",
     *                     example="Facultad de Ciencias y Tecnología"
     *                 ),
     *                 @OA\Property(
     *                     property="codigo_facultad",
     *                     type="string",
     *                     example="FCyT"
     *                 ),
     *                 @OA\Property(
     *                     property="pagina_facultad",
     *                     type="string",
     *                     example="https://fcyt.umss.edu.bo"
     *                 ),
     *                 @OA\Property(
     *                     property="id_usuario_updated_facultad",
     *                     type="integer",
     *                     description="ID del usuario que actualiza la facultad",
     *                     example="1"
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="CREATED",
     *         @OA\JsonContent(
     *             @OA\Property(property="id", type="number", example=1),
     *             @OA\Property(property="nombre_facultad", type="string", example="Facultad de Ciencias y Tecnología"),
     *             @OA\Property(property="codigo_facultad", type="string", example="FCyT"),
     *             @OA\Property(property="pagina_facultad", type="string", example="https://fcyt.umss.edu.bo"),
     *             @OA\Property(property="id_usuario_updated_facultad", type="integer", example=1),
     *             @OA\Property(property="created_at", type="string", example="2023-02-23T00:09:16.000000Z"),
     *             @OA\Property(property="updated_at", type="string", example="2023-02-23T12:33:45.000000Z")
     *         )
     *     )
     * )
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'nombre_facultad' => 'required|string|max:50',
                'codigo_facultad' => 'required|string|max:10|unique:facultades,codigo_facultad',
                'pagina_facultad' => 'nullable|string|max:100',
                'id_usuario_updated_facultad' => 'nullable|integer',
            ]);

            // Verificar si ya existe el código (validación adicional)
            if (Facultad::where('codigo_facultad', $validated['codigo_facultad'])->exists()) {
                throw ApiException::alreadyExists('facultad', 'código', $validated['codigo_facultad']);
            }

            $facultad = Facultad::create($validated);

            if (!$facultad) {
                throw ApiException::creationFailed('facultad');
            }

            return $this->successResponse($facultad, 'Facultad creada exitosamente', 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->handleValidationException($e);
        } catch (ApiException $e) {
            return $this->handleApiException($e);
        } catch (\Exception $e) {
            return $this->handleGeneralException($e);
        }
    }

    /**
     * Obtener una facultad específica
     * @OA\Get(
     *     path="/api/facultades/{id}",
     *     tags={"Facultad"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer"),
     *         description="ID de la facultad"
     *     ),
     *     @OA\Response(response=200, description="Facultad encontrada"),
     *     @OA\Response(response=404, description="Facultad no encontrada")
     * )
     */
    public function show($id)
    {
        try {
            $facultad = Facultad::find($id);

            if (!$facultad) {
                throw ApiException::notFound('facultad', $id);
            }

            return $this->successResponse($facultad, 'Facultad encontrada');
        } catch (ApiException $e) {
            return $this->handleApiException($e);
        } catch (\Exception $e) {
            return $this->handleGeneralException($e);
        }
    }

    /**
     * Actualizar una facultad
     * @OA\Put(
     *     path="/api/facultades/{id}",
     *     tags={"Facultad"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="nombre_facultad", type="string"),
     *             @OA\Property(property="codigo_facultad", type="string"),
     *             @OA\Property(property="pagina_facultad", type="string")
     *         )
     *     ),
     *     @OA\Response(response=200, description="Facultad actualizada"),
     *     @OA\Response(response=404, description="Facultad no encontrada"),
     *     @OA\Response(response=422, description="Errores de validación")
     * )
     */
    public function update(Request $request, $id)
    {
        try {
            $facultad = Facultad::find($id);

            if (!$facultad) {
                throw ApiException::notFound('facultad', $id);
            }

            $validated = $request->validate([
                'nombre_facultad' => 'sometimes|required|string|max:50',
                'codigo_facultad' => 'sometimes|required|string|max:10|unique:facultades,codigo_facultad,' . $id,
                'pagina_facultad' => 'nullable|string|max:100',
                'id_usuario_updated_facultad' => 'nullable|integer',
            ]);

            $updated = $facultad->update($validated);

            if (!$updated) {
                throw ApiException::updateFailed('facultad');
            }

            return $this->successResponse($facultad->fresh(), 'Facultad actualizada exitosamente');

        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->handleValidationException($e);
        } catch (ApiException $e) {
            return $this->handleApiException($e);
        } catch (\Exception $e) {
            return $this->handleGeneralException($e);
        }
    }

    /**
     * Eliminar una facultad
     * @OA\Delete(
     *     path="/api/facultades/{id}",
     *     tags={"Facultad"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=204, description="Facultad eliminada"),
     *     @OA\Response(response=404, description="Facultad no encontrada")
     * )
     */
    public function destroy($id)
    {
        try {
            $facultad = Facultad::find($id);

            if (!$facultad) {
                throw ApiException::notFound('facultad', $id);
            }

            $deleted = $facultad->delete();

            if (!$deleted) {
                throw ApiException::deletionFailed('facultad');
            }

            return response()->json(null, 204);

        } catch (ApiException $e) {
            return $this->handleApiException($e);
        } catch (\Exception $e) {
            return $this->handleGeneralException($e);
        }
    }   
}
