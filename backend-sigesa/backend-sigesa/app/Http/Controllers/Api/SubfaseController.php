<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\SubFase;

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
class SubfaseController extends Controller
{
    /**
     * Crear una nueva subfase
     * @OA\Post (
     *     path="/api/subfases",
     *     tags={"Subfase"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(
     *                 property="fase_id",
     *                 type="integer",
     *                 description="ID de la fase (Foreign Key)",
     *                 example=1
     *             ),
     *             @OA\Property(
     *                 property="nombre_subfase",
     *                 type="string",
     *                 example="Subfase 1"
     *             ),
     *             @OA\Property(
     *                 property="descripcion_subfase",
     *                 type="string",
     *                 example="Descripción de la subfase 1"
     *             ),
     *             @OA\Property(
     *                 property="fecha_inicio_subfase",
     *                 type="string",
     *                 format="date",
     *                 example="2023-01-01"
     *             ),
     *             @OA\Property(
     *                 property="fecha_fin_subfase",
     *                 type="string",
     *                 format="date",
     *                 example="2023-12-31"
     *             ),
     *             @OA\Property(
     *                 property="id_usuario_updated_subfase",
     *                 type="integer",
     *                 description="ID del usuario que actualiza la subfase",
     *                 example=1
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="CREATED",
     *         @OA\JsonContent(
     *             @OA\Property(property="id", type="integer", example=1),
     *             @OA\Property(property="fase_id", type="integer", example=1),
     *             @OA\Property(property="nombre_subfase", type="string", example="Subfase 1"),
     *             @OA\Property(property="descripcion_subfase", type="string", example="Descripción de la subfase 1"),
     *             @OA\Property(property="fecha_inicio_subfase", type="string", format="date", example="2023-01-01"),
     *             @OA\Property(property="fecha_fin_subfase", type="string", format="date", example="2023-12-31"),
     *             @OA\Property(property="id_usuario_updated_subfase", type="integer", example=1),
     *             @OA\Property(property="created_at", type="string", format="date-time", example="2023-01-01T00:00:00Z"),
     *             @OA\Property(property="updated_at", type="string", format="date-time", example="2023-01-01T00:00:00Z")
     *             )
     *      )
     * )
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'fase_id' => 'required|exists:fases,id',
            'nombre_subfase' => 'required|string|max:50',
            'descripcion_subfase' => 'nullable|string|max:300',
            'fecha_inicio_subfase' => 'nullable|date',
            'fecha_fin_subfase' => 'nullable|date',
            'id_usuario_updated_subfase' => 'nullable|integer',
        ]);

        $subFase = SubFase::create($validated);

        return response()->json($subFase, 201);
    }

    /**
     * Listado de todas las subfases
     * @OA\Get(
     *     path="/api/subfases",
     *     tags={"Subfase"},
     *     @OA\Response(
     *         response=200,
     *         description="OK",
     *         @OA\JsonContent(
     *             type="array",
     *             @OA\Items(
     *                 type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="fase_id", type="integer", description="ID de la fase (Foreign Key)", example=1),
     *                 @OA\Property(property="nombre_subfase", type="string", example="Subfase 1"),
     *                 @OA\Property(property="descripcion_subfase", type="string", example="Descripción de la subfase 1"),
     *                 @OA\Property(property="fecha_inicio_subfase", type="string", format="date", example="2023-01-01"),
     *                 @OA\Property(property="fecha_fin_subfase", type="string", format="date", example="2023-12-31"),
     *                 @OA\Property(property="id_usuario_updated_subfase",
     *                     type="integer",
     *                     description="ID del usuario que actualiza la subfase (Foreign Key)",
     *                     example=1
     *                 ),
     *                 @OA\Property(property="created_at", type="string", format="date-time", example="2023-01-01T00:00:00Z"),
     *                 @OA\Property(property="updated_at", type="string", format="date-time", example="2023-01-01T00:00:00Z")
     *             )
     *         )
     *     )
     * )
     */
    public function index()
    {
        $subFases = SubFase::all();
        return response()->json($subFases);
    }
}
