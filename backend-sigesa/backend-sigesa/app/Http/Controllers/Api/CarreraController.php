<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Models\Carrera;
use App\Exceptions\ApiException;

/**
* @OA\Tag(
*     name="Carrera",
*     description="Operaciones relacionadas con las carreras del sistema de acreditación UMSS SIGESA",
*     externalDocs={
*         "description": "Documentación de la API",
*         "url": "https://github.com/borisangulo/Sistema-de-Acreditacion-UMSS-SIGESA/blob/main/backend-sigesa/backend-sigesa/README.md"
*     }
* )
 */
class CarreraController extends BaseApiController
{
/**
     * Crear una nueva carrera
     * @OA\Post (
     *     path="/api/carreras",
     *     tags={"Carrera"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(
     *                 property="facultad_id",
     *                 type="integer",
     *                 description="ID de la facultad (Foreign Key)",
     *                 example=1
     *             ),
     *             @OA\Property(
     *                 property="codigo_carrera",
     *                 type="string",
     *                 example="INGSIS"
     *             ),
     *             @OA\Property(
     *                 property="nombre_carrera",
     *                 type="string",
     *                 example="Ingeniería de Sistemas"
     *             ),
     *             @OA\Property(
     *                 property="pagina_carrera",
     *                 type="string",
     *                 example="https://cs.umss.edu.bo"
     *             ),
     *             @OA\Property(
     *                 property="id_usuario_updated_carrera",
     *                 type="integer",
     *                 description="ID del usuario que actualiza la carrera", 
     *                 example=1
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="CREATED",
     *         @OA\JsonContent(
     *             @OA\Property(
     *                 property="id",
     *                 type="integer",
     *                 example=1
     *             ),
     *             @OA\Property(
     *                 property="facultad_id",
     *                 type="integer",
     *                 description="ID de la facultad (Foreign Key)",
     *                 example=1
     *             ),
     *             @OA\Property(
     *                 property="nombre_carrera",
     *                 type="string",
     *                 example="Ingeniería de Sistemas"
     *             ),
     *             @OA\Property(
     *                 property="codigo_carrera",
     *                 type="string",
     *                 example="INGSIS"
     *             ),
     *             @OA\Property(
     *                 property="pagina_carrera",
     *                 type="string",
     *                 example="https://cs.umss.edu.bo"
     *             ),
     *             @OA\Property(
     *                 property="created_at",
     *                 type="string",
     *                 example="2023-02-23T00:09:16.000000Z"
     *             ),
     *             @OA\Property(
     *                 property="updated_at",
     *                 type="string",
     *                 example="2023-02-23T12:33:45.000000Z"
     *             )
     *         )
     *     )
     * )
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'facultad_id' => 'required|exists:facultades,id',
                'codigo_carrera' => 'required|string|unique:carreras,codigo_carrera',
                'nombre_carrera' => 'required|string|max:50',
                'pagina_carrera' => 'nullable|string|max:100',
                'id_usuario_updated_carrera' => 'nullable|integer',
            ]);

            if (Carrera::where('codigo_carrera', $validated['codigo_carrera'] ?? '')->exists()) {
                throw ApiException::alreadyExists('carrera', 'codigo', $validated['codigo_carrera']);
            }

            $carrera = Carrera::create($validated);

            if (!$carrera){
                throw ApiException::creationFailed('carrera');
            }

            return $this->successResponse($carrera, 'Carrera creada exitosamente', 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e->errors());
        } catch (ApiException $e) {
            return $this->handleApiException($e); 
        }catch (\Exception $e) {
             return $this->handleGeneralException($e);
        }
    }

/**
     * Listado de todas las carreras
     * @OA\Get (
     *     path="/api/carreras",
     *     tags={"Carrera"},
     *     @OA\Response(
     *         response=200,
     *         description="Carreras obtenidas exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="exito", type="boolean", example=true),
     *             @OA\Property(property="estado", type="integer", example=200),
     *             @OA\Property(
     *                 property="datos",
     *                 type="array",
     *                 @OA\Items(
     *                     type="object",
     *                     @OA\Property(property="id", type="integer", example=1),
     *                     @OA\Property(property="facultad_id", type="integer", description="ID de la facultad (Foreign Key)", example=1),
     *                     @OA\Property(property="nombre_carrera", type="string", example="Ingeniería de Sistemas"),
     *                     @OA\Property(property="codigo_carrera", type="string", example="INGSIS"),
     *                     @OA\Property(property="pagina_carrera", type="string", example="https://cs.umss.edu.bo"),
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
     *             @OA\Property(property="error", type="string", example="Error al obtener las carreras: mensaje de error")
     *         )
     *     )
     * )
     */
    public function index()
    {
        try {
            $carreras = Carrera::all();

            if ($carreras->isEmpty()){
                return $this-> successResponse([], 'No hay carreras registradas', 200);
            }
            return $this->successResponse($carreras, 'Carreras obtenidas exitosamente', 200);
        } catch (\Exception $e) {
            return $this->errorResponse('Error al obtener las carreras: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Mostrar una carrera específica
     * @OA\Get (
     *     path="/api/carreras/{id}",
     *     tags={"Carrera"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer"),
     *         description="ID de la carrera"
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Carrera encontrada",
     *         @OA\JsonContent(
     *             @OA\Property(property="exito", type="boolean", example=true),
     *             @OA\Property(property="estado", type="integer", example=200),
     *             @OA\Property(
     *                 property="datos",
     *                 type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="facultad_id", type="integer", example=1),
     *                 @OA\Property(property="nombre_carrera", type="string", example="Ingeniería de Sistemas"),
     *                 @OA\Property(property="codigo_carrera", type="string", example="INGSIS"),
     *                 @OA\Property(property="pagina_carrera", type="string", example="https://cs.umss.edu.bo"),
     *                 @OA\Property(property="created_at", type="string", example="2023-02-23T00:09:16.000000Z"),
     *                 @OA\Property(property="updated_at", type="string", example="2023-02-23T12:33:45.000000Z")
     *             ),
     *             @OA\Property(property="error", type="string", nullable=true, example=null)
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Carrera no encontrada",
     *         @OA\JsonContent(
     *             @OA\Property(property="exito", type="boolean", example=false),
     *             @OA\Property(property="estado", type="integer", example=404),
     *             @OA\Property(property="datos", type="string", nullable=true, example=null),
     *             @OA\Property(property="error", type="string", example="Carrera no encontrada")
     *         )
     *     )
     * )
     */
    public function show($id)
    {
        try {
            $carrera = Carrera::find($id);

            if (!$carrera) {
                throw ApiException::notFound('carrera', $id);
            }

            return $this->successResponse($carrera, 'Carrera obtenida exitosamente');
        } catch (ApiException $e) {
            return $this->handleApiException($e);
        } catch (\Exception $e) {
            return $this->handleGeneralException($e);
        }
    }

    /**
     * Actualizar una carrera
     * @OA\Put (
     *     path="/api/carreras/{id}",
     *     tags={"Carrera"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer"),
     *         description="ID de la carrera"
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="facultad_id", type="integer", example=1),
     *             @OA\Property(property="codigo_carrera", type="string", example="INGSIS"),
     *             @OA\Property(property="nombre_carrera", type="string", example="Ingeniería de Sistemas"),
     *             @OA\Property(property="pagina_carrera", type="string", example="https://cs.umss.edu.bo"),
     *             @OA\Property(property="id_usuario_updated_carrera", type="integer", example=1)
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Carrera actualizada exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="exito", type="boolean", example=true),
     *             @OA\Property(property="estado", type="integer", example=200),
     *             @OA\Property(
     *                 property="datos",
     *                 type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="facultad_id", type="integer", example=1),
     *                 @OA\Property(property="nombre_carrera", type="string", example="Ingeniería de Sistemas"),
     *                 @OA\Property(property="codigo_carrera", type="string", example="INGSIS"),
     *                 @OA\Property(property="pagina_carrera", type="string", example="https://cs.umss.edu.bo"),
     *                 @OA\Property(property="created_at", type="string", example="2023-02-23T00:09:16.000000Z"),
     *                 @OA\Property(property="updated_at", type="string", example="2023-02-23T12:33:45.000000Z")
     *             ),
     *             @OA\Property(property="error", type="string", nullable=true, example=null)
     *         )
     *     )
     * )
     */
    public function update(Request $request, $id)
    {
        try {
            $carrera = Carrera::find($id);

            if (!$carrera) {
                throw ApiException::notFound('Carrera', $id);
            }

            $validated = $request->validate([
                'facultad_id' => 'sometimes|required|exists:facultades,id',
                'codigo_carrera' => 'sometimes|required|string|unique:carreras,codigo_carrera,' . $id,
                'nombre_carrera' => 'sometimes|required|string|max:50',
                'pagina_carrera' => 'nullable|string|max:100',
                'id_usuario_updated_carrera' => 'nullable|integer',
            ]);

            $updated = $carrera->update($validated);

            if (!$updated) {
                throw ApiException::updateFailed('carrera');
            }

            return $this->successResponse($carrera -> fresh(), 'Carrera actualizada exitosamente');
        } catch (ApiException $e) {
            return $this->handleApiException($e);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->handleValidationException($e);
        } catch (\Exception $e) {
            return $this->handleGeneralException($e);
        }
    }

    /**
     * Eliminar una carrera
     * @OA\Delete (
     *     path="/api/carreras/{id}",
     *     tags={"Carrera"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer"),
     *         description="ID de la carrera"
     *     ),
     *     @OA\Response(
     *         response=204,
     *         description="Carrera eliminada exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="exito", type="boolean", example=true),
     *             @OA\Property(property="estado", type="integer", example=200),
     *             @OA\Property(property="datos", type="string", nullable=true, example=null),
     *             @OA\Property(property="error", type="string", nullable=true, example=null)
     *         )
     *     )
     * )
     */
    public function destroy($id)
    {
        try {
            $carrera = Carrera::find($id);

            if (!$carrera) {
                throw ApiException::notFound('Carrera', $id);
            }

            $deleted = $carrera->delete();

            if (!$deleted) {
                throw ApiException::deletionFailed('carrera');
            }

            return response()->json(null, 204);
        } catch (ApiException $e) {
            return $this->handleApiException($e);
        } catch (\Exception $e) {
            return $this->handleGeneralException($e);
        }
    }

    /**
     * Obtener carreras de una facultad específica
     * @OA\Get (
     *     path="/api/facultades/{facultad}/carreras",
     *     tags={"Carrera"},
     *     @OA\Parameter(
     *         name="facultad",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer"),
     *         description="ID de la facultad"
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Carreras de la facultad obtenidas exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="exito", type="boolean", example=true),
     *             @OA\Property(property="estado", type="integer", example=200),
     *             @OA\Property(
     *                 property="datos",
     *                 type="array",
     *                 @OA\Items(
     *                     type="object",
     *                     @OA\Property(property="id", type="integer", example=1),
     *                     @OA\Property(property="facultad_id", type="integer", example=1),
     *                     @OA\Property(property="nombre_carrera", type="string", example="Ingeniería de Sistemas"),
     *                     @OA\Property(property="codigo_carrera", type="string", example="INGSIS"),
     *                     @OA\Property(property="pagina_carrera", type="string", example="https://cs.umss.edu.bo")
     *                 )
     *             ),
     *             @OA\Property(property="error", type="string", nullable=true, example=null)
     *         )
     *     )
     * )
     */
    public function getByFacultad($facultadId)
    {
        try {
            $carreras = Carrera::where('facultad_id', $facultadId)->get();

            if ($carreras->isEmpty()) {
                return $this->successResponse([], 'No hay carreras registradas para esta facultad', 200);
            }

            return $this->successResponse($carreras, 'Carreras de la facultad obtenidas exitosamente');
        } catch (\Exception $e) {
            return $this->errorResponse('Error al obtener las carreras de la facultad', 500, $e->getMessage());
        }
    }

    /**
     * Buscar carreras por nombre
     * @OA\Get (
     *     path="/api/carreras/buscar/{termino}",
     *     tags={"Carrera"},
     *     @OA\Parameter(
     *         name="termino",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="string"),
     *         description="Término de búsqueda"
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Resultados de búsqueda",
     *         @OA\JsonContent(
     *             @OA\Property(property="exito", type="boolean", example=true),
     *             @OA\Property(property="estado", type="integer", example=200),
     *             @OA\Property(
     *                 property="datos",
     *                 type="array",
     *                 @OA\Items(
     *                     type="object",
     *                     @OA\Property(property="id", type="integer", example=1),
     *                     @OA\Property(property="facultad_id", type="integer", example=1),
     *                     @OA\Property(property="nombre_carrera", type="string", example="Ingeniería de Sistemas"),
     *                     @OA\Property(property="codigo_carrera", type="string", example="INGSIS"),
     *                     @OA\Property(property="pagina_carrera", type="string", example="https://cs.umss.edu.bo")
     *                 )
     *             ),
     *             @OA\Property(property="error", type="string", nullable=true, example=null)
     *         )
     *     )
     * )
     */
    public function buscar($termino)
    {
        try {
            $carreras = Carrera::where('nombre_carrera', 'LIKE', '%' . $termino . '%')
                              ->orWhere('codigo_carrera', 'LIKE', '%' . $termino . '%')
                              ->get();

            if ($carreras->isEmpty()) {
                return $this->successResponse([], 'No se encontraron carreras que coincidan con el término de búsqueda', 200);
            }

            return $this->successResponse($carreras, 'Carreras encontradas exitosamente');
        } catch (\Exception $e) {
            return $this->errorResponse('Error al buscar carreras', 500, $e->getMessage());
        }
    }
}
