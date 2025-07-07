<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Fase;

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
class FaseController extends Controller
{
/**
    * Crear una nueva fase
    * @OA\Post (
    *     path="/api/fases",
    *     tags={"Fase"},
    *     @OA\RequestBody(
    *         required=true,
    *         @OA\JsonContent(
    *             @OA\Property(
    *                 property="carrera_modalidad_id",
    *                 type="integer",
    *                 description="ID de la carrera modalidad (Foreign Key)",
    *                 example=1
    *             ),
    *             @OA\Property(
    *                 property="nombre_fase",
    *                 type="string",
    *                 example="Fase 1"
    *             ),
    *             @OA\Property(
    *                 property="descripcion_fase",
    *                 type="string",
    *                 example="Descripción de la fase 1"
    *             ),
    *             @OA\Property(
    *                 property="fecha_inicio_fase",
    *                 type="string",
    *                 format="date",
    *                 example="2023-01-01"
    *             ),
    *             @OA\Property(
    *                 property="fecha_fin_fase",
    *                 type="string",
    *                 format="date",
    *                 example="2023-12-31"
    *             ),
    *             @OA\Property(
    *                 property="id_usuario_updated_fase",
    *                 type="integer",
    *                 description="ID del usuario que actualiza la fase",
    *                 example=1
    *             )
    *         )
    *     ),
    *     @OA\Response(
    *         response=201,
    *         description="CREATED",
    *         @OA\JsonContent(
    *             @OA\Property(property="id", type="integer", example=1),
    *             @OA\Property(property="carrera_modalidad_id", type="integer", example=1),
    *             @OA\Property(property="nombre_fase", type="string", example="Fase 1"),
    *             @OA\Property(property="descripcion_fase", type="string", example="Descripción de la fase 1"),
    *             @OA\Property(property="fecha_inicio_fase", type="string", format="date", example="2023-01-01"),
    *             @OA\Property(property="fecha_fin_fase", type="string", format="date", example="2023-12-31"),
    *             @OA\Property(property="id_usuario_updated_fase", type="integer", example=1),
    *             @OA\Property(property="created_at", type="string", format="datetime", example="2023-01-01T00:00:00Z"),
    *             @OA\Property(property="updated_at", type="string", format="datetime", example="2023-01-01T00:00:00Z")
    *         )
    *     )
    * )
    */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'carrera_modalidad_id' => 'required|exists:carrera_modalidades,id',
            'nombre_fase' => 'required|string|max:50',
            'descripcion_fase' => 'nullable|string|max:300',
            'fecha_inicio_fase' => 'nullable|date',
            'fecha_fin_fase' => 'nullable|date',
            'id_usuario_updated_fase' => 'nullable|integer',
        ]);

        $fase = Fase::create($validated);

        return response()->json($fase, 201);
    }

/**
     *Obtener todas las fases
     * @OA\Get (
     *     path="/api/fases",
     *     tags={"Fase"},
     *     @OA\Response(
     *         response=200,
     *         description="OK",
     *         @OA\JsonContent(
     *             @OA\Property(
     *                 type="array",
     *                 property="rows",
     *                 @OA\Items(
     *                     type="object",
     *                     @OA\Property(property="id", type="integer", example=1),
     *                     @OA\Property(property="carrera_modalidad_id", type="integer", example=1),
     *                     @OA\Property(property="nombre_fase", type="string", example="Fase 1"),
     *                     @OA\Property(property="descripcion_fase", type="string", example="Descripción de la fase 1"),
     *                     @OA\Property(property="fecha_inicio_fase", type="string", format="date", example="2023-01-01"),
     *                     @OA\Property(property="fecha_fin_fase", type="string", format="date", example="2023-12-31"),
     *                     @OA\Property(property="id_usuario_updated_fase", type="integer", example=1),
     *                     @OA\Property(property="created_at", type="string", format="datetime", example="2023-01-01T00:00:00Z"),
     *                     @OA\Property(property="updated_at", type="string", format="datetime", example="2023-01-01T00:00:00Z")
     *                 )
     *             )
     *         )
     *     )
     * )
     */
    public function index()
    {
        $fases = Fase::all();
        return response()->json($fases);
    }
}
