<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Carrera;

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
class CarreraController extends Controller
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
        $validated = $request->validate([
            'facultad_id' => 'required|exists:facultades,id',
            'codigo_carrera' => 'required|string|unique:carreras,codigo_carrera',
            'nombre_carrera' => 'required|string|max:50',
            'pagina_carrera' => 'nullable|string|max:100',
            'id_usuario_updated_carrera' => 'nullable|integer',
        ]);

        $carrera = Carrera::create($validated);

        return response()->json($carrera, 201);
    }

/**
     * Listado de todas las carreras
     * @OA\Get (
     *     path="/api/carreras",
     *     tags={"Carrera"},
     *     @OA\Response(
     *         response=200,
     *         description="OK",
     *         @OA\JsonContent(
     *             @OA\Property(
     *                 type="array",
     *                 property="rows",
     *                 @OA\Items(
     *                     type="object",
     *                     @OA\Property(
     *                         property="id",
     *                         type="number",
     *                         example="1"
     *                     ),
     *                     @OA\Property(
     *                         property="facultad_id",
     *                         type="number",
     *                         description="ID de la facultad (Foreign Key)",
     *                         example="1"
     *                     ),
     *                     @OA\Property(
     *                         property="nombre_carrera",
     *                         type="string",
     *                         example="Ingeniería de Sistemas"
     *                     ),
     *                     @OA\Property(
     *                         property="codigo_carrera",
     *                         type="string",
     *                         example="INGSIS"
     *                     ),
     *                     @OA\Property(
     *                         property="pagina_carrera",
     *                         type="string",
     *                         example="https://cs.umss.edu.bo"
     *                     ),
     *                     @OA\Property(
     *                         property="created_at",
     *                         type="string",
     *                         example="2023-02-23T00:09:16.000000Z"
     *                     ),
     *                     @OA\Property(
     *                         property="updated_at",
     *                         type="string",
     *                         example="2023-02-23T12:33:45.000000Z"
     *                     )
     *                 )
     *             )
     *         )
     *     )
     * )
     */
    public function index()
    {
        $carreras = Carrera::all();
        return response()->json($carreras);
    }
}
