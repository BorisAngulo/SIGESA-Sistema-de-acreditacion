<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Facultad;

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
class FacultadController extends Controller
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
     *                         property="nombre_facultad",
     *                         type="string",
     *                         example="Facultad de Ciencias y Tecnología"
     *                     ),
     *                     @OA\Property(
     *                         property="codigo_facultad",
     *                         type="string",
     *                         example="FCyT"
     *                     ),
     *                     @OA\Property(
     *                         property="pagina_facultad",
     *                         type="string",
     *                         example="https://fcyt.umss.edu.bo"
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
        $facultades = Facultad::all();
        return response()->json($facultades);
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
        $validated = $request->validate([
            'nombre_facultad' => 'required|string|max:50',
            'codigo_facultad' => 'required|string|max:10|unique:facultades,codigo_facultad',
            'pagina_facultad' => 'nullable|string|max:100',
            'id_usuario_updated_facultad' => 'nullable|integer',
        ]);

        $facultad = Facultad::create($validated);

        return response()->json($facultad, 201);
    }
}
