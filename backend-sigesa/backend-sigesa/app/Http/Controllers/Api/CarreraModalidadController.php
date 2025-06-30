<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\CarreraModalidad;

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
class CarreraModalidadController extends Controller
{
/**
     * Crear una nueva modalidad asociada a una carrera
     * @OA\Post (
     *     path="/api/carrera-modalidades",
     *     tags={"CarreraModalidad"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(
     *                 property="carrera_id",
     *                 type="integer",
     *                 description="ID de la carrera (Foreign Key)",
     *                 example=1
     *             ),
     *             @OA\Property(
     *                 property="modalidad_id",
     *                 type="integer",
     *                 description="ID de la modalidad (Foreign Key)",
     *                 example=1
     *             ),
     *             @OA\Property(
     *                 property="estado_modalidad",
     *                 type="boolean",
     *                 description="Estado de la modalidad (true para activa, false para inactiva)",
     *                 example=true
     *             ),
     *             @OA\Property(
     *                 property="id_usuario_updated_carrera_modalidad",
     *                 type="integer",
     *                 description="ID del usuario que actualiza la carrera modalidad",
     *                 example=1
     *             ),
     *             @OA\Property(
     *                 property="fecha_ini_aprobacion",
     *                 type="string",
     *                 format="date",
     *                 description="Fecha de inicio de aprobación",
     *                 example="2023-01-01"
     *             ),
     *             @OA\Property(
     *                 property="fecha_fin_aprobacion",
     *                 type="string",
     *                 format="date",
     *                 description="Fecha de fin de aprobación",
     *                 example="2023-12-31"
     *             ),
     *             @OA\Property(
     *                 property="certificado",
     *                 type="string",
     *                 description="Certificado asociado a la carrera modalidad",
     *                 example="Certificado de Acreditación"
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="CREATED",
     *         @OA\JsonContent(
     *             @OA\Property(property="id", type="integer", example=1),
     *             @OA\Property(property="carrera_id", type="integer", description="ID de la carrera (Foreign Key)", example=1),
     *             @OA\Property(property="modalidad_id", type="integer", description="ID de la modalidad (Foreign Key)", example=1),
     *             @OA\Property(property="estado_modalidad", type="boolean", example=true),
     *             @OA\Property(property="id_usuario_updated_carrera_modalidad", type="integer", description="ID del usuario que actualiza (Foreign Key)", example=1),
     *             @OA\Property(property="fecha_ini_aprobacion", type="string", format="date", example="2023-01-01"),
     *             @OA\Property(property="fecha_fin_aprobacion", type="string", format="date", example="2023-12-31"),
     *             @OA\Property(property="certificado", type="string", example="Certificado de Acreditación"),
     *             @OA\Property(property="created_at", type="string", format="date-time", example="2023-01-01T00:00:00Z"),
     *             @OA\Property(property="updated_at", type="string", format="date-time", example="2023-01-01T00:00:00Z")
     *        )
     *    )
     * )
     */
    public function store(Request $request)
    {
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

        return response()->json($carreraModalidad, 201);
    }

    /**
     * Listar todas las modalidades asociadas a carreras
     * @OA\Get(
     *     path="/api/carrera-modalidades",
     *     tags={"CarreraModalidad"},
     *     @OA\Response(
     *         response=200,
     *         description="OK",
     *         @OA\JsonContent(
     *             type="array",
     *             @OA\Items(
     *                 type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="carrera_id", type="integer", description="ID de la carrera (Foreign Key)", example=1),
     *                 @OA\Property(property="modalidad_id", type="integer", description="ID de la modalidad (Foreign Key)", example=1),
     *                 @OA\Property(property="estado_modalidad", type="boolean", description="Estado de la modalidad", example=true),
     *                 @OA\Property(property="id_usuario_updated_carrera_modalidad", type="integer", description="ID del usuario que actualiza (Foreign Key)", example=1),
     *                 @OA\Property(property="fecha_ini_aprobacion", type="string", format="date", description="Fecha de inicio de aprobación", example="2023-01-01"),
     *                 @OA\Property(property="fecha_fin_aprobacion", type="string", format="date", description="Fecha de fin de aprobación", example="2023-12-31"),
     *                 @OA\Property(property="certificado", type="string", description="Certificado asociado", example="Certificado de Acreditación"),
     *                 @OA\Property(property="created_at", type="string", format="date-time", example="2023-01-01T00:00:00Z"),
     *                 @OA\Property(property="updated_at", type="string", format="date-time", example="2023-01-01T00:00:00Z")
     *             )
     *         )
     *     )
     * )
     */
    public function index()
    {
        $carreraModalidades = CarreraModalidad::all();
        return response()->json($carreraModalidades);
    }
}
