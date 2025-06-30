<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

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
class ModalidadController extends Controller
{
/**
     * Crear una nueva modalidad
     * @OA\Post (
     *     path="/api/modalidades",
     *     tags={"Modalidad"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(
     *                 property="codigo_modalidad",
     *                 type="string",
     *                 example="MOD001"
     *             ),
     *             @OA\Property(
     *                 property="nombre_modalidad",
     *                 type="string",
     *                 example="Modalidad Presencial"
     *             ),
     *             @OA\Property(
     *                 property="descripcion_modalidad",
     *                 type="string",
     *                 example="Descripción de la modalidad presencial"
     *             ),
     *             @OA\Property(
     *                 property="id_usuario_updated_modalidad",
     *                 type="integer",
     *                 description="ID del usuario que actualiza la modalidad",
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
     *                 property="codigo_modalidad",
     *                 type="string",
     *                 example="CEUB"
     *             ),
     *             @OA\Property(
     *                 property="nombre_modalidad",
     *                 type="string",
     *                 example="CEUB"
     *             ),
     *             @OA\Property(
     *                 property="descripcion_modalidad",
     *                 type="string",
     *                 example="Descripción de la modalidad CEUB"
     *             ),
     *             @OA\Property(
     *                 property="id_usuario_updated_modalidad",
     *                 type="integer",
     *                 example=1
     *             ),
     *             @OA\Property(
     *                 property="created_at",
     *                 type="string",
     *                 format="date-time",
     *                 example="2023-02-23T00:09:16.000000Z"
     *             ),
     *             @OA\Property(
     *                 property="updated_at",
     *                 type="string",
     *                 format="date-time",
     *                 example="2023-02-23T12:33:45.000000Z"
     *             )
     *         )
     *     )
     * )
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'codigo_modalidad' => 'required|string|unique:modalidades,codigo_modalidad',
            'nombre_modalidad' => 'required|string|max:50',
            'descripcion_modalidad' => 'nullable|string|max:255',
            'id_usuario_updated_modalidad' => 'nullable|integer',
        ]);

        $modalidad = Modalidad::create($validated);

        return response()->json($modalidad, 201);
    }

    /**
     * Obtener todas las modalidades
     * @OA\Get (
     *     path="/api/modalidades",
     *     tags={"Modalidad"},
     *     @OA\Response(
     *         response=200,
     *         description="OK",
     *         @OA\JsonContent(
     *             type="array",
     *             @OA\Items(
     *                 type="object",
     *                 @OA\Property(
     *                     property="id",
     *                     type="integer",
     *                     example=1
     *                 ),
     *                 @OA\Property(
     *                     property="codigo_modalidad",
     *                     type="string",
     *                     example="CEUB"
     *                 ),
     *                 @OA\Property(
     *                     property="nombre_modalidad",
     *                     type="string",
     *                     example="CEUB"
     *                 ),
     *                 @OA\Property(
     *                     property="descripcion_modalidad",
     *                     type="string",
     *                     example="Descripción de la modalidad CEUB"
     *                 ),
     *                 @OA\Property(
     *                     property="id_usuario_updated_modalidad",
     *                     type="integer",
     *                     description="ID del usuario que actualiza la modalidad (Foreign Key)",
     *                     example=1
     *                 ),
     *                 @OA\Property(
     *                     property="created_at",
     *                     type="string",
     *                     format="date-time",
     *                     example="2023-02-23T00:09:16.000000Z"
     *                 ),
     *                 @OA\Property(
     *                     property="updated_at",
     *                     type="string",
     *                     format="date-time",
     *                     example="2023-02-23T12:33:45.000000Z"
     *                 )
     *             )
     *         )
     *     )
     * )
     */
    public function index()
    {
        $modalidades = Modalidad::all();
        return response()->json($modalidades);
    }
}
